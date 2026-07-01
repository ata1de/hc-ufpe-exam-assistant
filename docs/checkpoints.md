# Tópicos Avançados 4 - Checkpoints

## Grupo

- Antonio Robério
- Ithalo
- Mateus Ataide
- Eric Barreto
- Joyce Santana
- Mateus Guerra
- Luís Felipe

---

# PRIMEIRO CHECKPOINT

## 1. Contextualização

O foco do nosso grupo ficou relacionado à comunicação entre o setor de imagem e os demais setores do hospital.

Durante a primeira visita ao Hospital das Clínicas da Universidade Federal de Pernambuco, buscamos compreender melhor como funciona o fluxo de solicitação, marcação e realização dos exames de imagem, além de identificar os principais gargalos existentes nesse processo.

## 2. Profissionais Consultados

### Tiago Jornada

- Físico Médico
- Chefe da Unidade de Diagnóstico por Imagem do HC

### Karoline Andrade (Karol)

- Engenheira Biomédica
- Colaboradora do Setor de Engenharia Clínica

## 3. Entendimento Inicial do Problema

O principal problema identificado está relacionado à comunicação das informações necessárias para realização dos exames de imagem.

Atualmente, o fluxo ocorre da seguinte forma:

1. O paciente realiza uma consulta ambulatorial ou encontra-se internado e necessita realizar um exame.
2. O médico realiza a solicitação do exame no AGHU (Aplicativo de Gestão para Hospitais Universitários).
3. Dependendo do caso:
   - o próprio paciente realiza a marcação do exame;
   - ou a equipe de enfermagem realiza o agendamento, em casos de internação.
4. Após a realização do exame, o resultado fica disponível no sistema para o médico.

## 4. Problemas Observados

### 4.1 Diferentes formas de marcação

Os exames não possuem um único padrão de agendamento.

Dependendo do tipo de exame, a marcação pode acontecer:

- por formulário online;
- presencialmente pela central de marcação do hospital.

Isso gera dúvidas tanto para pacientes quanto para os profissionais envolvidos no processo.

Descrito no site: https://www.gov.br/pt-br/servicos/agendar-exames-no-hospital-das-clinicas-da-universidade-federal-de-pernambuco-hc-ufpe

### 4.2 Falha na comunicação das orientações dos exames

Muitos exames exigem preparações específicas antes da realização.

Alguns exemplos:

- jejum;
- suspensão de determinados medicamentos;
- preparo específico antes do exame;
- restrições alimentares;
- uso de contraste.

Foi relatado que é comum essas orientações não serem passadas corretamente ao paciente ou ao responsável pela marcação.

Como consequência:

- o exame precisa ser remarcado;
- ocorre desperdício de vagas;
- aumenta-se o tempo de espera;
- o hospital perde eficiência operacional;
- outros pacientes acabam sendo impactados pela indisponibilidade de horários.

### 4.3 Dificuldade de acesso às informações corretas

Outro ponto observado foi a dificuldade de centralizar as informações relacionadas aos exames.

Segundo o que foi discutido durante a visita, muitas vezes os profissionais precisam buscar manualmente informações sobre:

- forma correta de marcação;
- orientações específicas do exame;
- preparações necessárias;
- observações importantes sobre determinados procedimentos.

## 5. Possível Solução

### 5.1 Plataforma Web

A proposta inicial do grupo é desenvolver uma plataforma web voltada para centralização das informações relacionadas aos exames de imagem do hospital.

A escolha por uma plataforma web ocorre pela facilidade de acesso, já que a solução poderia ser utilizada em computadores do hospital, celulares e outros dispositivos sem necessidade de instalação de aplicativos específicos.

O principal objetivo da solução é reduzir falhas de comunicação relacionadas:

- ao processo de marcação dos exames;
- às orientações necessárias para realização dos procedimentos;
- ao acesso rápido às informações corretas sobre cada exame.

### 5.2 Usuários da Plataforma

A solução seria voltada principalmente para três grupos de usuários:

#### Médicos

Os médicos poderiam acessar rapidamente:

- orientações relacionadas aos exames;
- preparações necessárias;
- restrições específicas;
- informações sobre contraste;
- forma correta de marcação do procedimento.

A ideia é facilitar o momento da solicitação do exame, reduzindo dúvidas e evitando falhas na comunicação das orientações ao paciente.

#### Equipe de Enfermagem

A equipe responsável pela marcação dos exames poderia utilizar a plataforma para:

- consultar o fluxo correto de agendamento;
- verificar documentos ou preparações necessárias;
- confirmar orientações antes de realizar a marcação;
- acessar rapidamente informações específicas de cada exame.

#### Pacientes

Os pacientes poderiam acessar orientações simplificadas sobre seus exames, utilizando uma linguagem mais acessível e menos técnica.

Por exemplo:

- necessidade de jejum;
- horário recomendado;
- uso de medicamentos;
- documentação necessária;
- local correto para marcação;
- cuidados antes e depois do exame.

### 5.3 Organização das Informações

Um dos pontos discutidos pelo grupo é que as informações não deveriam ser exibidas da mesma forma para todos os usuários.

A plataforma poderia adaptar o conteúdo dependendo do perfil de acesso.

Por exemplo:

- médicos e equipe de enfermagem teriam acesso a informações mais técnicas e operacionais;
- pacientes visualizariam instruções simplificadas e mais objetivas.

Isso ajudaria a melhorar a comunicação e reduzir interpretações incorretas.

### 5.4 Uso de Chatbot ou Agente Inteligente

Outra ideia discutida foi a utilização de um chatbot ou agente conversacional dentro da plataforma.

Esse agente poderia auxiliar usuários por meio de perguntas simples, como:

- "Como marcar uma tomografia?"
- "Preciso estar em jejum para esse exame?"
- "Onde esse exame deve ser agendado?"
- "Quais documentos preciso levar?"
- "Esse exame utiliza contraste?"

A utilização de um sistema conversacional poderia facilitar o acesso às informações e tornar o processo mais intuitivo, principalmente para pacientes.

Além disso, o chatbot poderia funcionar como uma camada de apoio para reduzir dúvidas frequentes e diminuir falhas de comunicação.

## 6. Benefícios Esperados

Com a implementação da solução, espera-se:

- reduzir a quantidade de exames remarcados;
- melhorar a comunicação entre os setores;
- facilitar o acesso às informações;
- diminuir dúvidas sobre exames e agendamentos;
- reduzir desperdícios operacionais;
- melhorar a experiência dos pacientes;
- aumentar a eficiência do fluxo de exames de imagem no hospital.

## 7. Próximos Passos

Os próximos passos do grupo serão:

- aprofundar o entendimento do fluxo atual, validar se o problema de fato é esse que pensamos e compartilhar a solução que pretendemos implementar;
- entender quais informações são mais importantes no processo;
- ter acesso às fontes dessas informações mais importantes para o processo;
- definir melhor as funcionalidades da solução proposta.

---

# SEGUNDO CHECKPOINT

## Validação do Problema

Durante as novas reuniões com os profissionais do Hospital das Clínicas, foi possível confirmar o problema identificado no primeiro checkpoint. O foco da solução está na experiência dos usuários ao buscar informações sobre os exames, bem como na centralização dessas informações em um único local.

A proposta evoluiu para a criação de um repositório de informações que reúna orientações, preparações, formas de agendamento e demais informações relevantes sobre os exames realizados pelo setor de imagem.

## Evolução da Solução

A solução será desenvolvida como uma aplicação web responsiva, podendo ser utilizada tanto em computadores quanto em dispositivos móveis.

Também foi apresentada a ideia de um chatbot inteligente alimentado com informações dos exames para responder dúvidas frequentes dos usuários. A proposta foi bem recebida pelos profissionais consultados.

## Sugestões dos Clientes

Os clientes sugeriram a utilização de uma representação visual do corpo humano, permitindo que o usuário selecione regiões do corpo para visualizar os exames relacionados àquela área. A ideia será avaliada para possível inclusão na solução.

## Informações Necessárias

Para o desenvolvimento da plataforma, será necessário obter e organizar os seguintes materiais:

- Planilha com a lista de exames realizados pelo setor de imagem do HC;
- Documento PDF contendo orientações para parte dos exames;
- Documentos físicos contendo orientações para os demais exames (6 folhas + algumas outras pendentes).

Esses materiais servirão como base para o conteúdo da plataforma e para o treinamento do chatbot.

## Restrições

Não haverá acesso a usuários finais para realização de testes durante o projeto. Dessa forma, as validações ocorrerão principalmente com os profissionais envolvidos no processo.

## Próximos Passos

Para o próximo encontro com os clientes, será importante apresentar uma versão minimamente navegável da solução, uma vez que outros grupos já iniciaram a apresentação de protótipos.

Além disso, o grupo pretende:

- Reunir a documentação necessária;
- Estruturar o conteúdo dos exames;
- Desenvolver os primeiros protótipos;
- Avaliar a implementação da navegação por regiões do corpo humano;
- Definir a estrutura inicial do chatbot inteligente.

---

# TERCEIRO CHECKPOINT

Nesse checkpoint, apresentamos o projeto para Karol e para a professora.

Alguns pontos que Karol comentou:

1. Na parte do paciente, antes de deixar ele interagir diretamente com o chat devemos guiar o paciente um pouco mais. Pode haver mais perguntas tipo "Qual o seu exame?" e aparecer uma lista dos exames para ele selecionar. Logo depois, de acordo com o exame selecionado fazer mais perguntas, tipo "Com contraste ou sem contraste?". Nesse sentido
2. Usar tons mais claros e azul em vez de um dark mode
3. Na parte de profissional, dar meio que um passo a passo do que o profissional deve fazer. Tem o roteiro em um dos documentos word que ela mandou, mas seria algo como isso aqui:
   a. "Fale para paciente para cadastrar solicitação do exame na aghu"
   b. "Informe as condições do paciente"
      i. O exame é com contraste ou sem contraste?
      ii. O exame é com sedação e sem sedação?
      iii. O exame tem medicamentos associados?
      iv. O paciente tem limitação de mobilidade?
      v. O paciente faz uso contínuo de suporte de oxigênio?
      vi. Exame com contraste, o paciente já tem que ter o acesso (acesso é algo médico, deve ser acesso venoso, algo assim). Ele já tem?
   c. …. (tem mais mas não consegui anotar)
4. **TESTAR BEM E DOCUMENTAR AS LIMITAÇÕES!!!!!!!**
