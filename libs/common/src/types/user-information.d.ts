export type UserInformation = {
  id: string;
  email: string;
  name: string;
  roles?: {
    role: {
      name: string;
      permissions: {
        permission: {
          name: string;
        };
      }[];
    };
  }[];
};
