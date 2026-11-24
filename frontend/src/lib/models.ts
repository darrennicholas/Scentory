export type Note = { id:string; name:string; category:string; description:string|null; perfumes?: { perfumeId:string; perfume:{id:string;name:string;brand:string} }[] };
export type Perfume = { id:string; name:string; brand:string; concentration:string; fragranceFamily:string; volumeMl:number|null; description:string|null; imageUrl:string|null; purchasePrice:string|null; purchaseDate:string|null; notes:{noteId:string;layer:string;note:Note}[]; review:{id:string;overallRating:number;longevityRating:number|null;projectionRating:number|null;reviewText:string|null;testedDate:string|null}|null; collections:{collection:{id:string;name:string}}[] };
export type Page<T> = { data:T[]; meta:{page:number;limit:number;total:number;totalPages:number} };
export const families = ['CITRUS','FLORAL','WOODY','AMBER','FRESH','GOURMAND','AROMATIC','LEATHER','CHYPRE','FOUGERE','OTHER'];
export const concentrations = ['EAU_DE_COLOGNE','EAU_DE_TOILETTE','EAU_DE_PARFUM','PARFUM','EXTRAIT_DE_PARFUM','OTHER'];
export const categories = ['CITRUS','FLORAL','WOODY','SPICY','FRUITY','SWEET','GREEN','MUSKY','RESINOUS','OTHER'];
export const label = (value:string) => value.toLowerCase().replaceAll('_',' ').replace(/\b\w/g, x => x.toUpperCase());
export type Review = {id:string;perfumeId:string;overallRating:number;longevityRating:number|null;projectionRating:number|null;reviewText:string|null;testedDate:string|null;createdAt:string;perfume:Perfume};
export type WishlistItem = {id:string;name:string;brand:string;concentration:string;fragranceFamily:string|null;imageUrl:string|null;estimatedPrice:string|null;priority:string;notes:string|null};

