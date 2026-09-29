# Publicação no Railway

Este projeto usa Next.js e MySQL. As fotos enviadas são arquivos persistentes.

## Serviços

1. Crie um projeto Railway com o repositório Raynner/Loja-online-estudos.
2. Adicione um serviço MySQL no mesmo projeto e ambiente.
3. No serviço do site, use npm run build para compilar e npm start -- --hostname 0.0.0.0 para iniciar. O Next.js lê a porta PORT fornecida pelo Railway.
4. Anexe um volume ao serviço do site, montado em /data. Configure UPLOAD_DIR=/data/uploads. Mantenha uma réplica enquanto usar este volume.
5. Gere um domínio público HTTPS. Configure APP_ORIGIN com a origem completa, sem barra final (exemplo: https://sua-loja.up.railway.app).

## Variáveis do site

Use referências às variáveis do serviço MySQL, pelo seletor do Railway:

| Variável do site | Variável do MySQL |
| --- | --- |
| DB_HOST | MYSQLHOST |
| DB_PORT | MYSQLPORT |
| DB_USER | MYSQLUSER |
| DB_PASSWORD | MYSQLPASSWORD |
| DB_NAME | MYSQLDATABASE |

Use a conexão privada entre serviços. Não copie os valores de localhost do computador para o Railway.

## Dados e fotos existentes

A criação do MySQL no Railway não copia as tabelas do computador. Antes de disponibilizar a loja, importe a estrutura e os produtos existentes. A conta administrativa pode ser migrada com seu hash de senha; não é necessário transportar sessões ou tentativas de login antigas.

Copie os arquivos da pasta local uploads para /data/uploads no volume, preservando os nomes. As URLs /api/images/... continuarão funcionando. Fotos em public/images acompanham o Git apenas se estiverem versionadas.

Não envie .env.local, .env.admin.local, dumps do banco ou senhas para o GitHub. Configure backups dos volumes do MySQL e das fotos no Railway.

## Verificação antes da entrega

- Catálogo e filtros exibem os produtos reais.
- Sem login, /admin redireciona e alterações de produtos são recusadas.
- Login, cadastro, edição e desativação funcionam via HTTPS.
- Upload de foto funciona e permanece disponível após um novo deploy.
- Botão WhatsApp abre o número da loja com o produto correto.
- Backup do banco e das fotos está configurado.

A compilação local não substitui esses testes no ambiente publicado.
