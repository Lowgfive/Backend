

/*
  Dùng type thay vì interface
*/
export type UserType = {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  description : string;
  reading_history?: string[];
};

