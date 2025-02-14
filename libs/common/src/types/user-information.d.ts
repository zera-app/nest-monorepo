export type UserInformation = {
  id: string;
  email: string;
  name: string;
  roles?: {
    role: {
      name: string;
      scope: string;
    };
  }[];
  permissions?: string[];
};
