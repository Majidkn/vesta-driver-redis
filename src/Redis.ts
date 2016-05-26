import {RedisClient, createClient} from "redis";
import {Database, IDatabaseConfig, ISchemaList} from "vesta-schema/Database";
import {IQueryResult, IUpsertResult, IDeleteResult} from "vesta-schema/ICRUDResult";
import {Vql, Condition} from "vesta-schema/Vql";
import {IModelValues} from "vesta-schema/Model";
import {Err} from "vesta-util/Err";
import {DatabaseError} from "vesta-schema/error/DatabaseError";

export class Redis extends Database {
    private connection:RedisClient;
    private schemaList:ISchemaList = {};
    private config:IDatabaseConfig;

    public connect():Promise<Database> {
        if (this.connection) return Promise.resolve(this);
        return new Promise<Database>((resolve, reject)=> {
            var client = createClient(this.config.port, this.config.host);
            client.on('ready', ()=> {
                this.connection = client;
                resolve(this);
                console.log('Redis connection established');
            });
            client.on('error', (error)=> {
                reject(error);
                console.log('Redis Error', error);
            });
            client.on('reconnecting', ()=> {
                console.log('Redis connection established');
            });
        })
    }

    constructor(config:IDatabaseConfig, schemaList:ISchemaList) {
        super();
        this.schemaList = schemaList;
        this.config = config;
    }

    findById<T>(id:string):Promise<IQueryResult<T>> {
        return new Promise<IUpsertResult<T>>((resolve, reject)=> {
            this.connection.get(id, (err, reply)=> {
                if (err) return reject(new DatabaseError(Err.Code.DBInsert, err.message));
                var data = null;
                if (reply) {
                    try {
                        data = <T>JSON.parse(reply);
                    } catch (e) {
                        data = reply;
                    }
                    resolve(data);
                } else {
                    resolve(null);
                }
            });
        })
    }

    findByModelValues<T>(model:string, modelValues:IModelValues, limit:number):Promise<IQueryResult<T>> {
        return undefined;
    }

    findByQuery<T>(query:Vql):Promise<IQueryResult<T>> {
        return undefined;
    }

    insertOne<T>(model:string, value:T):Promise<IUpsertResult<T>> {
        return new Promise<IUpsertResult<T>>((resolve, reject)=> {
            this.connection.set(model, value, (err)=> {
                if (err) return reject(new DatabaseError(Err.Code.DBInsert, err.message));
                resolve();
            });
        })
    }

    updateOne<T>(model:string, value:T):Promise<IUpsertResult<T>> {
        return undefined;
    }

    updateAll<T>(model:string, newValues:IModelValues, condition:Condition):Promise<IUpsertResult<T>> {
        return undefined;
    }

    deleteOne(model:string, id:number|string):Promise<IDeleteResult> {
        return undefined;
    }

    deleteAll(model:string, condition:Condition):Promise<IDeleteResult> {
        return undefined;
    }

    init() {
        return undefined;
    }
}