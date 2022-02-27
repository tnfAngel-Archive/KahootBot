const Kahoot = require('kahoot.js-updated');
const readline = require('readline');

const readlines = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

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

const log = {
	success: (message: string): void =>
		console.log(`\x1B[1;32m[+]\x1B[1;0m ${message}`),
	error: (message: string): void =>
		console.log(`\x1B[1;31m[-]\x1B[1;0m ${message}`),
	question: (message: string): string => `\x1B[1;34m[?]\x1B[1;0m ${message}`
};

const wait = (time: number) =>
	new Promise((resolve) => setTimeout(resolve, time));

function formatNumber(number: number): string {
	if (number < 10) return `0${number}`;
	return `${number}`;
}

function start() {
	readlines.question(
		log.question('Nombre del bot lider: '),
		(leaderNameInput: string) => {
			if (!leaderNameInput) {
				log.error('No ingresaste ningún nombre del bot lider.');
				return start();
			}
			readlines.question(
				log.question('Nombre de los bots a crear: '),
				(nameInput: string) => {
					if (!nameInput) {
						log.error('No ingresaste ningún nombre de los bots.');
						return start();
					}
					readlines.question(
						log.question('Numero de bots a crear: '),
						(botsInput: string) => {
							if (!botsInput) {
								log.error(
									'No ingresaste ningún numero de bots.'
								);
								return start();
							}

							const bots = parseInt(botsInput);

							if (isNaN(bots)) {
								log.error(
									'No ingresaste un numero valido de bots a crear.'
								);
								return start();
							}

							if (bots < 1) {
								log.error('El numero de bots es muy pequeño.');
								return start();
							}
							readlines.question(
								log.question('Pin de la partida: '),
								async (pinInput: string) => {
									if (!pinInput) {
										log.error(
											'No ingresaste ningún pin de la partida.'
										);
										return start();
									}

									const leader = new Kahoot();

									await wait(1000);

									const successLeaderSession = await leader
										.join(pinInput, leaderNameInput)
										.then(() => {
											log.success(
												`[LEADER] Sesión lider iniciada como ${leader.name}.`
											);
											return true;
										})
										.catch(() => {
											log.error(
												`[LEADER] Error intentando acceder a la sala ${pinInput} como ${leaderNameInput}.`
											);
											return false;
										});

									if (!successLeaderSession) return start();

									console.log(leader);

									leader.on('QuizStart', (quiz) => {
										log.success(
											`[LEADER] Nuevo quiz empezado de ${quiz.questionCount} preguntas.`
										);
									});

									leader.on(
										'QuestionReady',
										async (question: any) => {
											log.success(
												`[LEADER] Nueva pregunta de ${question.numberOfChoices} respuestas.`
											);
										}
									);

									leader.on(
										'QuestionStart',
										async (question: any) => {
											const answer = Math.floor(
												Math.random() *
													question.numberOfChoices
											);

											await question
												.answer(answer)
												.then(() => {
													log.success(
														`[LEADER] Respondiendo con numero ${answer} como ${leader.name}.`
													);
												})
												.catch(() => {
													log.error(
														`[LEADER] No he podido responder con el numero ${answer} como ${leader.name}.`
													);
												});
										}
									);

									leader.on(
										'QuestionEnd',
										async (question: any) => {
											log.success(
												`[LEADER] Pregunta acabada con las respuestas correctas: ${
													question.correctChoices
														? question.correctChoices
																.map(
																	(choice) =>
																		choice +
																		1
																)
																.join(', ')
														: 'Ninguna'
												}.`
											);
										}
									);

									leader.on('QuizEnd', (quiz) => {
										log.success(
											`[LEADER] Quiz acabado (${quiz.quizTitle}).`
										);
										stop();
									});

									for (let i = 0; i < bots; i++) {
										const clientNumber = formatNumber(
											i + 1
										);

										const name = `${nameInput} ${clientNumber}`;

										const client = new Kahoot();

										await wait(1000);

										client
											.join(pinInput, name)
											.then(() => {
												log.success(
													`[SLAVE ${clientNumber}] Sesión iniciada como ${client.name}.`
												);
												return true;
											})
											.catch(() => {
												log.error(
													`[SLAVE ${clientNumber}] Error intentando iniciar sesion como ${name}`
												);
												return false;
											});

										client.on(
											'QuestionStart',
											async (question: any) => {
												const answer = Math.floor(
													Math.random() *
														question.numberOfChoices
												);

												await question
													.answer(answer)
													.then(() => {
														log.success(
															`[SLAVE ${clientNumber}] Respondiendo con numero ${answer} como ${client.name}.`
														);
													})
													.catch(() => {
														log.error(
															`[SLAVE ${clientNumber}] No he podido responder con el numero ${answer} como ${client.name}.`
														);
													});
											}
										);
									}
								}
							);
						}
					);
				}
			);
		}
	);
}

function stop() {
	log.error(`Saliendo...`);
	process.exit(0);
}

start();
