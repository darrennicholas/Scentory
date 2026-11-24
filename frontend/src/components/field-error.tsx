import {ApiError} from '@/lib/api';
export function FieldError({error,field,clientErrors}:{error:unknown;field:string;clientErrors?:Record<string,string[]>}) {
  const messages = clientErrors?.[field]?.length ? clientErrors[field] : error instanceof ApiError ? error.fieldErrors?.[field] : undefined;
  return <>{messages?.map((message,index)=><span className="field-error" key={`${field}-${index}`}>{message}</span>)}</>;
}
