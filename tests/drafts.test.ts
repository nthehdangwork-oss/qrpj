import test from 'node:test';
import assert from 'node:assert/strict';
import {saveDraft,readDraft,draftKey} from '../src/lib/drafts';
import {templateContent} from '../src/lib/landing';
function memory(){const data=new Map<string,string>();return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};}
test('changing templates and editing the preview title preserves separate drafts',()=>{
 const a=memory(),b=memory(),stores=[a,b];const first={templateId:'couple-2',content:templateContent('couple-2')};
 a.setItem(draftKey,JSON.stringify(first));saveDraft({templateId:'occasion-6',content:templateContent('occasion-6')},stores);
 assert.deepEqual(JSON.parse(readDraft(stores,'couple-2')!),first);
 const next={...first,content:{...first.content,pageTitle:'Title đã sửa tại Preview'}};assert.ok(saveDraft(next,stores));
 assert.equal(JSON.parse(readDraft(stores,'couple-2')!).content.pageTitle,next.content.pageTitle);
 assert.equal(JSON.parse(readDraft(stores)!).templateId,'couple-2');
 assert.equal(JSON.parse(readDraft(stores,'occasion-6')!).templateId,'occasion-6');
});
test('blocked storage falls back and malformed legacy JSON does not prevent saving',()=>{
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};const available=memory();available.setItem(draftKey,'{');const draft={templateId:'couple-1',content:templateContent('couple-1')};
 assert.ok(saveDraft(draft,[blocked,available]));assert.deepEqual(JSON.parse(readDraft([blocked,available])!),draft);assert.equal(saveDraft(draft,[blocked]),false);
});
