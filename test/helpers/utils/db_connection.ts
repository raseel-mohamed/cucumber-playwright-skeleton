import {Connector} from '@google-cloud/cloud-sql-connector';
import {Pool, PoolClient, QueryResultRow} from 'pg';

export type CloudSqlPostgresConfig = {
    instanceConnectionName: string; // project:region:instance
    database: string;
    user: string;
    password?: string;
    ipType?: 'PUBLIC' | 'PRIVATE' | 'PSC';
    authType?: 'IAM' | 'PASSWORD';
    useIamDbAuth?: boolean;
    maxPoolSize?: number;
};

export default class DbConnection {
    private readonly connector = new Connector();
    private pool: Pool | null = null;
    private readonly config: CloudSqlPostgresConfig;

    constructor(config: CloudSqlPostgresConfig) {
        this.config = {
            ipType: 'PUBLIC',
            useIamDbAuth: false,
            maxPoolSize: 5,
            ...config,
        }
    }

    private async getPool(): Promise<Pool> {
        if (!this.pool) {
            throw new Error('Client is not connected. Call connect() first.');
        }
        return this.pool;
    }

    async connect(): Promise<void> {
        if (this.pool) return;
        let optionEntries = {
            instanceConnectionName: this.config.instanceConnectionName,
            ipType: this.config.ipType,
            ...(this.config.useIamDbAuth ? {authType: 'IAM' as const} : {}),
        }
        // @ts-ignore
        const options = await this.connector.getOptions(optionEntries);
        let poolOptions = {
            ...options,
            user: this.config.user,
            password: this.config.password,
            database: this.config.database,
            max: this.config.maxPoolSize,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 30_000,
        }
        this.pool = new Pool(poolOptions);

    }

    async query<T extends QueryResultRow = QueryResultRow>(
        sql: string,
        params: unknown[] = [],
    ): Promise<T[]> {
        const result = await (await this.getPool()).query<T>(sql, params);
        return result.rows;
    }

    async getById<T extends QueryResultRow>(
        table: string,
        id: number | string,
        idColumn = 'id',
    ): Promise<T | null> {
        const rows = await this.query<T>(
            `SELECT *
             FROM ${table}
             WHERE ${idColumn} = $1 LIMIT 1`,
            [id],
        );
        return rows[0] ?? null;
    }

    async insert<T extends QueryResultRow>(
        sql: string,
        params: unknown[] = [],
    ): Promise<T | null> {
        const rows = await this.query<T>(sql, params);
        return rows[0] ?? null;
    }

    async update<T extends QueryResultRow>(
        sql: string,
        params: unknown[] = [],
    ): Promise<T[]> {
        return this.query<T>(sql, params);
    }

    async remove(sql: string, params: unknown[] = []): Promise<number> {
        const rows = await this.query(sql, params);
        return rows.length;
    }

    async close(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
        this.connector.close();
    }
}
