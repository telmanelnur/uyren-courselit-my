import { createModel, MembershipSchema } from "@workspace/common-logic";

MembershipSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: 'userId',
    justOne: true,
});


const MembershipModel = createModel("Membership", MembershipSchema);

export default MembershipModel;
