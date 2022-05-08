import { Document } from 'mongoose';
import { IUser } from './user';

export type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (
    ...a: Parameters<T>
) => TNewReturn;

export interface Pagination {
    records: number;
    total_records: number;
    limit: number;
    page: number;
    total_page: number;
}

export type ServerResponse<T> = T extends Document[]
    ? { data: { records: T; pagination: Pagination } }
    : T extends Document
    ? { data: { record: T | null } }
    : { data?: Record<string, any> };

export type ApiResponse<T = any> = ServerResponse<T> & { message: string };

type Join<K, P> = K extends string | number
    ? P extends string | number
        ? `${K}${'' extends P ? '' : '.'}${P}`
        : never
    : never;

type Prev = [
    never,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    ...0[]
];

export type Leaves<T, D extends number = 10> = D extends never
    ? never
    : T extends object
    ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
    : '';

export type FieldOfModel<T extends Document> = Leaves<
    Omit<T, keyof Document>,
    5
>;

export interface IsDelete {
    isDelete: boolean;
}

export type OmitIsDelete<T extends IsDelete> = Omit<T, 'isDelete'>;

export type FieldUserUpdate = Omit<
    OmitIsDelete<IUser>,
    'email' | 'password' | 'passwordModified' | 'role'
>;

export interface UnavailableTime {
    date: Date;
    time: string;
}

export enum TokenType {
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token',
}
