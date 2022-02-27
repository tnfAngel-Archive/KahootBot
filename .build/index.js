console.log(`
888              .d888      d8888                            888      888888b.            888    
888             d88P"      d88888                            888      888  "88b           888    
888             888       d88P888                            888      888  .88P           888    
888888 88888b.  888888   d88P 888 88888b.   .d88b.   .d88b.  888      8888888K.   .d88b.  888888 
888    888 "88b 888     d88P  888 888 "88b d88P"88b d8P  Y8b 888      888  "Y88b d88""88b 888    
888    888  888 888    d88P   888 888  888 888  888 88888888 888      888    888 888  888 888    
Y88b.  888  888 888   d8888888888 888  888 Y88b 888 Y8b.     888      888   d88P Y88..88P Y88b.  
 "Y888 888  888 888  d88P     888 888  888  "Y88888  "Y8888  888      8888888P"   "Y88P"   "Y888 
                                                888                                              
                                           Y8b d88P                                              
                                            "Y88P"  
    -> Kahoot Bot v1.1
`);
const Kahoot = require("kahoot.js-updated");
const readline = require("readline");
const readlines = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const log = {
  success: (message) => console.log(`[1;32m[+][1;0m ${message}`),
  error: (message) => console.log(`[1;31m[-][1;0m ${message}`),
  question: (message) => `[1;34m[?][1;0m ${message}`
};
const wait = (time) => new Promise((resolve) => setTimeout(resolve, time));
function formatNumber(number) {
  if (number < 10)
    return `0${number}`;
  return `${number}`;
}
async function stdinQuestion(question) {
  return new Promise((resolve) => {
    readlines.question(log.question(question), (input) => resolve(input));
  });
}
async function start() {
  const leaderNameInput = await stdinQuestion("Nombre del bot l\xEDder: ");
  if (!leaderNameInput) {
    log.error("No ingresaste ning\xFAn nombre del bot l\xEDder.");
    return start();
  }
  const nameInput = await stdinQuestion("Nombre de los bots a crear: ");
  if (!nameInput) {
    log.error("No ingresaste ning\xFAn nombre de los bots.");
    return start();
  }
  const botsInput = await stdinQuestion("N\xFAmero de bots a crear: ");
  if (!botsInput) {
    log.error("No ingresaste ning\xFAn n\xFAmero de bots.");
    return start();
  }
  const bots = parseInt(botsInput);
  if (isNaN(bots)) {
    log.error("No ingresaste un n\xFAmero valido de bots a crear.");
    return start();
  }
  if (bots < 1) {
    log.error("El n\xFAmero de bots es muy peque\xF1o.");
    return start();
  }
  const pinInput = await stdinQuestion("Pin de la partida: ");
  if (!pinInput) {
    log.error("No ingresaste ning\xFAn pin de la partida.");
    return start();
  }
  const leader = new Kahoot();
  await wait(1e3);
  const successLeaderSession = await leader.join(pinInput, leaderNameInput).then(() => {
    log.success(`[LEADER] Sesi\xF3n l\xEDder iniciada como ${leader.name}.`);
    return true;
  }).catch(() => {
    log.error(`[LEADER] Error intentando acceder a la sala ${pinInput} como ${leaderNameInput}.`);
    return false;
  });
  if (!successLeaderSession)
    return start();
  console.log(leader);
  leader.on("QuizStart", (quiz) => {
    log.success(`[LEADER] Nuevo quiz empezado de ${quiz.questionCount} preguntas.`);
  });
  leader.on("QuestionReady", async (question) => {
    log.success(`[LEADER] Nueva pregunta de ${question.numberOfChoices} respuestas.`);
  });
  leader.on("QuestionStart", async (question) => {
    const answer = Math.floor(Math.random() * question.numberOfChoices);
    await question.answer(answer).then(() => {
      log.success(`[LEADER] Respondiendo con n\xFAmero ${answer} como ${leader.name}.`);
    }).catch(() => {
      log.error(`[LEADER] No he podido responder con el n\xFAimero ${answer} como ${leader.name}.`);
    });
  });
  leader.on("QuestionEnd", async (question) => {
    log.success(`[LEADER] Pregunta acabada con las respuestas correctas: ${question.correctChoices ? question.correctChoices.map((choice) => choice + 1).join(", ") : "Ninguna"}.`);
  });
  leader.on("QuizEnd", (quiz) => {
    log.success(`[LEADER] Quiz acabado (${quiz.quizTitle}).`);
    stop();
  });
  for (let i = 0; i < bots; i++) {
    const clientNumber = formatNumber(i + 1);
    const name = `${nameInput} ${clientNumber}`;
    const client = new Kahoot();
    await wait(1e3);
    client.join(pinInput, name).then(() => {
      log.success(`[SLAVE ${clientNumber}] Sesi\xF3n iniciada como ${client.name}.`);
      return true;
    }).catch(() => {
      log.error(`[SLAVE ${clientNumber}] Error intentando iniciar sesi\xF3n como ${name}`);
      return false;
    });
    client.on("QuestionStart", async (question) => {
      const answer = Math.floor(Math.random() * question.numberOfChoices);
      await question.answer(answer).then(() => {
        log.success(`[SLAVE ${clientNumber}] Respondiendo con n\xFAmero ${answer} como ${client.name}.`);
      }).catch(() => {
        log.error(`[SLAVE ${clientNumber}] No he podido responder con el n\xFAmero ${answer} como ${client.name}.`);
      });
    });
  }
}
function stop() {
  console.log("\n");
  log.error(`Saliendo...`);
  readlines.pause();
  process.exit(0);
}
start();
readlines.on("SIGINT", () => stop());
//# sourceMappingURL=index.js.map
