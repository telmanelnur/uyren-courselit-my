import PaymentPlanModel from "@/models/PaymentPlan";
import {
    createDomainRequiredMiddleware,
    protectedProcedure,
} from "@/server/api/core/procedures";
import {
    ConflictException,
    NotFoundException,
    ValidationException,
} from "@/server/api/core/exceptions";
import { getFormDataSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { Constants } from "@workspace/common-models";
import { getPaymentMethodFromSettings } from "@/server/services/payment";
import { fetchEntity, checkEntityPermission } from "@/server/api/routers/community/helpers";
import { z } from "zod";
import { responses } from "@/config/strings";
import DomainModel from "@/models/Domain";



export const paymentPlanRouter = router({
    create: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .input(getFormDataSchema({
            name: z.string().min(2).max(100),
            type: z.nativeEnum(Constants.PaymentPlanType),
            oneTimeAmount: z.number().optional(),
            emiAmount: z.number().optional(),
            emiTotalInstallments: z.number().optional(),
            subscriptionMonthlyAmount: z.number().optional(),
            subscriptionYearlyAmount: z.number().optional(),
            entityId: z.string().min(2).max(100),
            entityType: z.nativeEnum(Constants.MembershipEntityType),
        }))
        .mutation(async ({ ctx, input }) => {
            const {
                name,
                type,
                oneTimeAmount,
                emiAmount,
                emiTotalInstallments,
                subscriptionMonthlyAmount,
                subscriptionYearlyAmount,
                entityId,
                entityType,
            } = input.data;

            const domain = await DomainModel.findById(ctx.domainData.domainObj._id);
            if (!domain) {
                throw new ConflictException("Domain",  ctx.domainData.domainObj._id);
            }
            

            if (type === Constants.PaymentPlanType.ONE_TIME && !oneTimeAmount) {
                throw new ValidationException(
                    "One-time amount is required for one-time payment plan",
                );
            }
            if (
                type === Constants.PaymentPlanType.EMI &&
                (!emiAmount || !emiTotalInstallments)
            ) {
                throw new ValidationException(
                    "EMI amounts and total installments are required for EMI payment plan",
                );
            }
            if (
                type === Constants.PaymentPlanType.SUBSCRIPTION &&
                ((!subscriptionMonthlyAmount && !subscriptionYearlyAmount) ||
                    (subscriptionMonthlyAmount && subscriptionYearlyAmount))
            ) {
                throw new ValidationException(
                    "Either monthly or yearly amount is required for subscription payment plan, but not both",
                );
            }

            const entity = await fetchEntity(
                entityType,
                entityId,
                domain._id.toString(),
            );
            if (!entity) {
                throw new NotFoundException("Entity");
            }

            checkEntityPermission(entityType, ctx.user.permissions);

            const existingPlansForEntity = await PaymentPlanModel.find({
                domain: domain._id,
                planId: { $in: entity.paymentPlans },
                archived: false,
            });

            for (const plan of existingPlansForEntity) {
                if (plan.type === type) {
                    if (plan.type !== Constants.PaymentPlanType.SUBSCRIPTION) {
                        throw new ConflictException(responses.duplicate_payment_plan);
                    }
                    if (subscriptionMonthlyAmount && plan.subscriptionMonthlyAmount) {
                        throw new ConflictException(responses.duplicate_payment_plan);
                    }
                    if (subscriptionYearlyAmount && plan.subscriptionYearlyAmount) {
                        throw new ConflictException(responses.duplicate_payment_plan);
                    }
                }
            }

            const paymentMethod = await getPaymentMethodFromSettings(
                domain.settings,
            );
            if (!paymentMethod && type !== Constants.PaymentPlanType.FREE) {
                throw new ConflictException("Payment information required");
            }

            const paymentPlan = await PaymentPlanModel.create({
                domain: domain._id,
                userId: ctx.user.userId,
                name,
                type,
                oneTimeAmount,
                emiAmount,
                emiTotalInstallments,
                subscriptionMonthlyAmount,
                subscriptionYearlyAmount,
            });

            if (entity.paymentPlans.length === 0) {
                entity.defaultPaymentPlan = paymentPlan.planId;
            }

            entity.paymentPlans.push(paymentPlan.planId);
            await entity.save();

            return paymentPlan;
        }),

    archive: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .input(getFormDataSchema({
            planId: z.string().min(1, "Plan ID is required"),
            entityId: z.string().min(1, "Entity ID is required"),
            entityType: z.nativeEnum(Constants.MembershipEntityType),
        }))
        .mutation(async ({ ctx, input }) => {
            
            const domain = await DomainModel.findById(ctx.domainData.domainObj._id);
            if (!domain) {
                throw new ConflictException("Domain",  ctx.domainData.domainObj._id);
            }
            

            const { planId, entityId, entityType } = input.data;

            const entity = await fetchEntity(
                entityType,
                entityId,
                domain._id.toString(),
            );
            if (!entity) {
                throw new NotFoundException("Entity");
            }

            checkEntityPermission(entityType, ctx.user.permissions);

            const paymentPlan = await PaymentPlanModel.findOne({
                domain: domain._id,
                planId,
            });
            if (!paymentPlan) {
                throw new NotFoundException("Payment plan");
            }

            if (entity.defaultPaymentPlan === paymentPlan.planId) {
                throw new ConflictException(
                    responses.default_payment_plan_cannot_be_archived
                );
            }

            paymentPlan.archived = true;
            await paymentPlan.save();

            return paymentPlan;
        }),

    changeDefaultPlan: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .input(getFormDataSchema({
            planId: z.string().min(1, "Plan ID is required"),
            entityId: z.string().min(1, "Entity ID is required"),
            entityType: z.nativeEnum(Constants.MembershipEntityType),
        }))
        .mutation(async ({ ctx, input }) => {
            const domain = await DomainModel.findById(ctx.domainData.domainObj._id);
            if (!domain) {
                throw new ConflictException("Domain",  ctx.domainData.domainObj._id);
            }
            const { planId, entityId, entityType } = input.data;

            const entity = await fetchEntity(entityType, entityId, domain._id.toString());
            if (!entity) {
                throw new NotFoundException("Entity");
            }

            checkEntityPermission(entityType, ctx.user.permissions);

            const paymentPlan = await PaymentPlanModel.findOne({
                domain: domain._id,
                planId,
                archived: false,
            });
            if (!paymentPlan) {
                throw new NotFoundException("Payment plan");
            }

            entity.defaultPaymentPlan = paymentPlan.planId;
            await entity.save();

            return paymentPlan;
        }),
});


