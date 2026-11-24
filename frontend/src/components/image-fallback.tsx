'use client';
import {useState} from 'react';
import {resolveImageUrl} from '@/lib/api';
export function ImageFallback({src,alt,className='card-image',style}:{src?:string|null;alt:string;className?:string;style?:React.CSSProperties}){
 const [failed,setFailed]=useState(false);
 const imageUrl=resolveImageUrl(src);
 return imageUrl&&!failed?<img className={className} style={style} src={imageUrl} alt={alt} onError={()=>setFailed(true)}/>:<div className={`${className} empty-image`} style={style} role="img" aria-label={`No image available for ${alt}`}>SCENTORY</div>;
}
