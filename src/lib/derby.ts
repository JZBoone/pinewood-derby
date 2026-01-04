import { derby } from '@generated/client';

export type GetDerbiesResponse = {
  derbies: derby[];
};

export type GetDerbyByIdResponse = {
  derby: derby | null;
};
