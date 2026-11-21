import { UserRole } from "../../common/enums/user-role.enum";

export interface User {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}