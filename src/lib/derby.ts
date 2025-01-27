import { derby } from '@prisma/client';

export type GetAllDerbyResponse = {
  derbies: derby[];
};

export type GetDerbyByIdResponse = {
  derby: derby | null;
};
