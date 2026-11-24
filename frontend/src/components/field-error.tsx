import {ApiError} from '@/lib/api';
export function FieldError({error,field}:{error:unknown;field:string}) { if(!(error instanceof ApiError))return null; return <>{error.fieldErrors?.[field]?.map(message=><span className="field-error" key={message}>{message}</span>)}</>; }
