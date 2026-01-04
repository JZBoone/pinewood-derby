import { derby } from '../../prisma/generated/prisma/client';

export type GetDerbiesResponse = {
  derbies: derby[];
};

export type GetDerbyByIdResponse = {
  derby: derby | null;
};
