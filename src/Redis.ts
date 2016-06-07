import {RedisClient, createClient} from "redis";
import {Database, IDatabaseConfig, ISchemaList, IModelCollection} from "vesta-schema/Database";
import {IQueryResult, IUpsertResult, IDeleteResult} from "vesta-schema/ICRUDResult";
import {Vql, Condition} from "vesta-schema/Vql";
import {IModelValues} from "vesta-schema/Model";
import {Err} from "vesta-util/Err";
import {DatabaseError} from "vesta-schema/error/DatabaseError";

export class Redis extends Database {
    private connection:RedisClient;
    private schemaList:ISchemaList = {};
    private models:IModelCollection = {};
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

    constructor(config:IDatabaseConfig, models:IModelCollection) {
        super();
        var schemaList:ISchemaList = {};
        for (var model in models) {
            if (models.hasOwnProperty(model)) {
                schemaList[model] = models[model].schema;
            }
        }
        this.schemaList = schemaList;
        this.models = models;
        this.config = config;
    }

    findById<T>(id:string):Promise<IQueryResult<T|string>> {
        return new Promise<IQueryResult<T|string>>((resolve, reject)=> {
            this.connection.get(id, (err, reply)=> {
                var result:IQueryResult<T|string> = <IQueryResult<T|string>>{};
                if (err) return reject(new DatabaseError(Err.Code.DBInsert, err.message));
                if (reply) {
                    try {
                        result.items = [<T>JSON.parse(reply)]
                    } catch (e) {
                        result.items = [reply];
                    }
                }
                resolve(result);
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

    insertAll<T>(model:string, values:Array<T>):Promise<IUpsertResult<T>> {
        return undefined;
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