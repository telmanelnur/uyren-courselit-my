import { createModel } from "@workspace/common-logic";
import { UserSchema } from "@workspace/common-logic";

const UserModel = createModel("User", UserSchema);

export default UserModel;
