import type {CardContent} from './rules';
export const draftKey='gui-thuong-draft';
export type Draft={templateId:string;content:CardContent};
type DraftStorage=Pick<Storage,'getItem'|'setItem'>;
export function saveDraft(draft:Draft,stores:DraftStorage[]):boolean {
 const payload=JSON.stringify(draft);let saved=false;
 for(const storage of stores){try{
  const previous=storage.getItem(draftKey);
  if(previous){try{const old=JSON.parse(previous);if(typeof old.templateId==='string'&&old.templateId!==draft.templateId)storage.setItem(`${draftKey}:${old.templateId}`,previous);}catch{/* A malformed legacy draft must not block a valid new draft. */}}
  storage.setItem(`${draftKey}:${draft.templateId}`,payload);storage.setItem(draftKey,payload);saved=true;
 }catch{/* Try the other storage when this browser blocks one of them. */}}
 return saved;
}
export function readDraft(stores:DraftStorage[],templateId?:string):string|null {
 const keys=templateId?[`${draftKey}:${templateId}`,draftKey]:[draftKey];
 for(const key of keys)for(const storage of stores){try{const raw=storage.getItem(key);if(raw)return raw;}catch{/* Continue with the remaining storage. */}}
 return null;
}
