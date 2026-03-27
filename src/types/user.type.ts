

/*
  Dùng type thay vì interface
*/
export type UserType = {
  username: string;
  email: string;
  password: string;
  avatar?: string;
  description : string;
  language?: "en" | "vi";
  reading_history?: string[];
  role?: "user" | "admin";
};

