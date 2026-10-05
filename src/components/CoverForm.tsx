"use client";
import { useState, type ChangeEvent } from "react";
import { saveCover } from "../actions/cover";
export function CoverForm({initialImage}: {initialImage:string}) {
 const [image,setImage]=useState(initialImage);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 async function upload(event: ChangeEvent<HTMLInputElement>) {
 const input=event.currentTarget; const file=input.files?.[0]; if(!file)return;
 setError("");setSuccess("");
 if(file.size>5*1024*1024){setError("Selecione uma imagem de até 5 MB.");input.value="";return;}
 setBusy(true);
 try {const data=new FormData();data.set("image",file);const response=await fetch("/api/uploads",{method:"POST",body:data});const result=await response.json();if(!response.ok)throw new Error(result.error || "Falha ao enviar a imagem.");setImage(result.imageUrl);}
 catch(error){setError(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");}
 finally{setBusy(false);input.value="";}
 }
 async function persist(value:string){setBusy(true);setError("");setSuccess("");try{const result=await saveCover(value);if(result.error)setError(result.error);else{setImage(value);setSuccess(result.success || "Capa salva.");}}catch{setError("Não foi possível salvar. Tente novamente.");}finally{setBusy(false);}}
 return <section className="admin-form cover-settings" aria-labelledby="cover-title"><h2 id="cover-title">Capa do site</h2><p className="admin-help">Troque a imagem de destaque ao lado da apresentação da loja. Envie uma foto, confira a prévia e salve.</p><img className="admin-image-preview" src={image} alt="Prévia da capa do site"/><label htmlFor="cover-image">Escolher nova imagem</label><input id="cover-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy}/><p className="admin-help">JPG, PNG ou WebP, até 5 MB. Prefira uma imagem quadrada ou horizontal.</p>{busy && <p role="status">Processando imagem…</p>}{error && <p className="login-error" role="alert">{error}</p>}{success && <p className="admin-success" role="status">{success}</p>}<div className="cover-actions"><button className="product-button" type="button" disabled={busy} onClick={()=>persist(image)}>Salvar capa</button><button className="category-button" type="button" disabled={busy} onClick={()=>persist("/images/bouquet.svg")}>Restaurar ilustração original</button></div></section>;
}
