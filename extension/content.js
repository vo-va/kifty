(() => {
	'use strict';

	const SEEK_SECONDS = 10;
	// The player does not expose the frame rate, so frame stepping assumes 30 fps.
	const FRAME_SECONDS = 1 / 30;
	// Same list as the player's own "Playback speed" menu, so the hotkeys never produce a rate the menu cannot show.
	const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
	const TOAST_MS = 800;
	// The player's own hotkey for "fill window", its equivalent of theater mode.
	const PLAYER_FILL_WINDOW_KEY = 'w';
	const WRAPPER_SELECTOR = '.av-player-control-wrapper';
	const TOP_Z_INDEX = '2147483647';
	// Physical keys of the player's own hotkeys and the character it matches for each; relayed on non-Latin layouts.
	const PLAYER_KEYS = {KeyF: 'f', KeyW: 'w', KeyM: 'm', KeyC: 'c'};
	/*
	 * UI text per browser language. Kept in this file rather than in _locales because the Safari Xcode project lists
	 * every resource file explicitly, and because chrome.i18n follows the browser UI language, not the preferred languages.
	 */
	const STRINGS = {
		en: {
			title: 'Keyboard shortcuts',
			dismiss: 'Dismiss',
			playback: 'Playback',
			general: 'General',
			captions: 'Subtitles and closed captions',
			togglePlay: 'Toggle play/pause',
			rewind10: 'Rewind 10 seconds',
			forward10: 'Fast forward 10 seconds',
			rewind5: 'Rewind 5 seconds',
			forward5: 'Fast forward 5 seconds',
			prevFrame: 'Previous frame (while paused)',
			nextFrame: 'Next frame (while paused)',
			slower: 'Decrease playback rate',
			faster: 'Increase playback rate',
			seekPercent: 'Seek to specific point in the video (7 advances to 70% of duration)',
			fullscreen: 'Toggle full screen',
			theater: 'Toggle theater mode',
			fillWindow: 'Toggle fill window',
			miniplayer: 'Toggle miniplayer',
			closeDialog: 'Close miniplayer or current dialog',
			mute: 'Toggle mute',
			volume: 'Volume up / down',
			shortcuts: 'Show/hide keyboard shortcuts',
			captionsToggle: 'If the video supports captions, toggle captions ON/OFF',
			note: 'Seek, speed, frame and percent keys are ignored on live streams.',
			layout: '(US QWERTY layout)',
			play: 'Play',
			pause: 'Pause',
			prevFrameToast: 'Previous frame',
			nextFrameToast: 'Next frame',
			theaterToast: 'Theater mode',
			miniplayerOn: 'Miniplayer',
			miniplayerOff: 'Miniplayer off',
			seconds: 's',
			space: 'SPACE',
			escape: 'ESCAPE',
			shift: 'SHIFT'
		},
		fr: {
			title: 'Raccourcis clavier',
			dismiss: 'Fermer',
			playback: 'Lecture',
			general: 'Général',
			captions: 'Sous-titres',
			togglePlay: 'Lecture/pause',
			rewind10: 'Retour arrière de 10 secondes',
			forward10: 'Avance rapide de 10 secondes',
			rewind5: 'Retour arrière de 5 secondes',
			forward5: 'Avance rapide de 5 secondes',
			prevFrame: 'Image précédente (en pause)',
			nextFrame: 'Image suivante (en pause)',
			slower: 'Diminuer la vitesse de lecture',
			faster: 'Augmenter la vitesse de lecture',
			seekPercent: 'Aller à un point précis de la vidéo (7 avance à 70 % de la durée)',
			fullscreen: 'Activer/désactiver le plein écran',
			theater: 'Activer/désactiver le mode cinéma',
			fillWindow: 'Activer/désactiver le remplissage de la fenêtre',
			miniplayer: 'Activer/désactiver le lecteur réduit',
			closeDialog: 'Fermer le lecteur réduit ou la boîte de dialogue',
			mute: 'Activer/désactiver le son',
			volume: 'Augmenter / baisser le volume',
			shortcuts: 'Afficher/masquer les raccourcis clavier',
			captionsToggle: 'Activer/désactiver les sous-titres, si la vidéo en propose',
			note: "Les touches de navigation, de vitesse, d'image et de pourcentage sont ignorées pendant les directs.",
			layout: '(disposition US QWERTY)',
			play: 'Lecture',
			pause: 'Pause',
			prevFrameToast: 'Image précédente',
			nextFrameToast: 'Image suivante',
			theaterToast: 'Mode cinéma',
			miniplayerOn: 'Lecteur réduit',
			miniplayerOff: 'Lecteur réduit désactivé',
			seconds: 's',
			space: 'ESPACE',
			escape: 'ÉCHAP',
			shift: 'MAJ'
		},
		es: {
			title: 'Combinaciones de teclas',
			dismiss: 'Cerrar',
			playback: 'Reproducción',
			general: 'General',
			captions: 'Subtítulos',
			togglePlay: 'Reproducir/pausar',
			rewind10: 'Retroceder 10 segundos',
			forward10: 'Avanzar 10 segundos',
			rewind5: 'Retroceder 5 segundos',
			forward5: 'Avanzar 5 segundos',
			prevFrame: 'Fotograma anterior (en pausa)',
			nextFrame: 'Fotograma siguiente (en pausa)',
			slower: 'Reducir la velocidad de reproducción',
			faster: 'Aumentar la velocidad de reproducción',
			seekPercent: 'Ir a un punto concreto del vídeo (7 avanza al 70 % de la duración)',
			fullscreen: 'Activar/desactivar pantalla completa',
			theater: 'Activar/desactivar modo cine',
			fillWindow: 'Activar/desactivar ajuste a la ventana',
			miniplayer: 'Activar/desactivar minirreproductor',
			closeDialog: 'Cerrar el minirreproductor o el cuadro de diálogo actual',
			mute: 'Activar/desactivar el sonido',
			volume: 'Subir / bajar el volumen',
			shortcuts: 'Mostrar/ocultar combinaciones de teclas',
			captionsToggle: 'Activar/desactivar subtítulos si el vídeo los tiene',
			note: 'Las teclas de búsqueda, velocidad, fotograma y porcentaje no funcionan en las emisiones en directo.',
			layout: '(distribución US QWERTY)',
			play: 'Reproducir',
			pause: 'Pausa',
			prevFrameToast: 'Fotograma anterior',
			nextFrameToast: 'Fotograma siguiente',
			theaterToast: 'Modo cine',
			miniplayerOn: 'Minirreproductor',
			miniplayerOff: 'Minirreproductor desactivado',
			seconds: 's',
			space: 'ESPACIO',
			escape: 'ESC',
			shift: 'MAYÚS'
		},
		de: {
			title: 'Tastenkombinationen',
			dismiss: 'Schließen',
			playback: 'Wiedergabe',
			general: 'Allgemein',
			captions: 'Untertitel',
			togglePlay: 'Wiedergabe/Pause',
			rewind10: '10 Sekunden zurückspulen',
			forward10: '10 Sekunden vorspulen',
			rewind5: '5 Sekunden zurückspulen',
			forward5: '5 Sekunden vorspulen',
			prevFrame: 'Vorheriger Frame (wenn pausiert)',
			nextFrame: 'Nächster Frame (wenn pausiert)',
			slower: 'Wiedergabegeschwindigkeit verringern',
			faster: 'Wiedergabegeschwindigkeit erhöhen',
			seekPercent: 'Zu einer bestimmten Stelle im Video springen (7 springt zu 70 % der Dauer)',
			fullscreen: 'Vollbild ein/aus',
			theater: 'Kinomodus ein/aus',
			fillWindow: 'Fensterfüllend ein/aus',
			miniplayer: 'Miniplayer ein/aus',
			closeDialog: 'Miniplayer oder aktuelles Dialogfeld schließen',
			mute: 'Stummschaltung ein/aus',
			volume: 'Lautstärke erhöhen / verringern',
			shortcuts: 'Tastenkombinationen ein-/ausblenden',
			captionsToggle: 'Untertitel ein/aus, falls das Video welche hat',
			note: 'Spul-, Geschwindigkeits-, Frame- und Prozenttasten sind bei Livestreams deaktiviert.',
			layout: '(US-QWERTY-Layout)',
			play: 'Wiedergabe',
			pause: 'Pause',
			prevFrameToast: 'Vorheriger Frame',
			nextFrameToast: 'Nächster Frame',
			theaterToast: 'Kinomodus',
			miniplayerOn: 'Miniplayer',
			miniplayerOff: 'Miniplayer aus',
			seconds: 's',
			space: 'LEERTASTE',
			escape: 'ESC',
			shift: 'UMSCHALT'
		},
		pt: {
			title: 'Atalhos do teclado',
			dismiss: 'Fechar',
			playback: 'Reprodução',
			general: 'Geral',
			captions: 'Legendas',
			togglePlay: 'Reproduzir/pausar',
			rewind10: 'Retroceder 10 segundos',
			forward10: 'Avançar 10 segundos',
			rewind5: 'Retroceder 5 segundos',
			forward5: 'Avançar 5 segundos',
			prevFrame: 'Frame anterior (quando pausado)',
			nextFrame: 'Próximo frame (quando pausado)',
			slower: 'Diminuir a velocidade de reprodução',
			faster: 'Aumentar a velocidade de reprodução',
			seekPercent: 'Ir para um ponto específico do vídeo (7 avança para 70% da duração)',
			fullscreen: 'Ativar/desativar tela cheia',
			theater: 'Ativar/desativar modo teatro',
			fillWindow: 'Ativar/desativar preencher janela',
			miniplayer: 'Ativar/desativar miniplayer',
			closeDialog: 'Fechar o miniplayer ou a caixa de diálogo atual',
			mute: 'Ativar/desativar o som',
			volume: 'Aumentar / diminuir o volume',
			shortcuts: 'Mostrar/ocultar atalhos do teclado',
			captionsToggle: 'Ativar/desativar legendas, se o vídeo tiver',
			note: 'As teclas de busca, velocidade, frame e porcentagem não funcionam em transmissões ao vivo.',
			layout: '(layout US QWERTY)',
			play: 'Reproduzir',
			pause: 'Pausar',
			prevFrameToast: 'Frame anterior',
			nextFrameToast: 'Próximo frame',
			theaterToast: 'Modo teatro',
			miniplayerOn: 'Miniplayer',
			miniplayerOff: 'Miniplayer desativado',
			seconds: 's',
			space: 'ESPAÇO',
			escape: 'ESC',
			shift: 'SHIFT'
		},
		ru: {
			title: 'Горячие клавиши',
			dismiss: 'Закрыть',
			playback: 'Воспроизведение',
			general: 'Общие',
			captions: 'Субтитры',
			togglePlay: 'Воспроизвести/приостановить',
			rewind10: 'Перемотать назад на 10 секунд',
			forward10: 'Перемотать вперёд на 10 секунд',
			rewind5: 'Перемотать назад на 5 секунд',
			forward5: 'Перемотать вперёд на 5 секунд',
			prevFrame: 'Предыдущий кадр (на паузе)',
			nextFrame: 'Следующий кадр (на паузе)',
			slower: 'Уменьшить скорость воспроизведения',
			faster: 'Увеличить скорость воспроизведения',
			seekPercent: 'Перейти к определённому моменту видео (7 — к 70% длительности)',
			fullscreen: 'Включить/выключить полноэкранный режим',
			theater: 'Включить/выключить широкоэкранный режим',
			fillWindow: 'Включить/выключить режим «во всё окно»',
			miniplayer: 'Включить/выключить мини-проигрыватель',
			closeDialog: 'Закрыть мини-проигрыватель или текущее окно',
			mute: 'Включить/выключить звук',
			volume: 'Увеличить / уменьшить громкость',
			shortcuts: 'Показать/скрыть горячие клавиши',
			captionsToggle: 'Включить/выключить субтитры, если они есть',
			note: 'Перемотка, скорость, покадровый переход и переход по процентам не работают в прямых трансляциях.',
			layout: '(раскладка ENG US QWERTY)',
			play: 'Воспроизведение',
			pause: 'Пауза',
			prevFrameToast: 'Предыдущий кадр',
			nextFrameToast: 'Следующий кадр',
			theaterToast: 'Широкоэкранный режим',
			miniplayerOn: 'Мини-проигрыватель',
			miniplayerOff: 'Мини-проигрыватель выключен',
			seconds: 'с',
			space: 'ПРОБЕЛ',
			escape: 'ESC',
			shift: 'SHIFT'
		},
		uk: {
			title: 'Комбінації клавіш',
			dismiss: 'Закрити',
			playback: 'Відтворення',
			general: 'Загальні',
			captions: 'Субтитри',
			togglePlay: 'Відтворити/призупинити',
			rewind10: 'Перемотати назад на 10 секунд',
			forward10: 'Перемотати вперед на 10 секунд',
			rewind5: 'Перемотати назад на 5 секунд',
			forward5: 'Перемотати вперед на 5 секунд',
			prevFrame: 'Попередній кадр (на паузі)',
			nextFrame: 'Наступний кадр (на паузі)',
			slower: 'Зменшити швидкість відтворення',
			faster: 'Збільшити швидкість відтворення',
			seekPercent: 'Перейти до певного моменту відео (7 — до 70% тривалості)',
			fullscreen: 'Увімкнути/вимкнути повноекранний режим',
			theater: 'Увімкнути/вимкнути режим кінотеатру',
			fillWindow: 'Увімкнути/вимкнути режим «на все вікно»',
			miniplayer: 'Увімкнути/вимкнути мініплеєр',
			closeDialog: 'Закрити мініплеєр або поточне вікно',
			mute: 'Увімкнути/вимкнути звук',
			volume: 'Збільшити / зменшити гучність',
			shortcuts: 'Показати/сховати комбінації клавіш',
			captionsToggle: 'Увімкнути/вимкнути субтитри, якщо вони є',
			note: 'Перемотування, швидкість, покадровий перехід і перехід за відсотками не працюють у прямих трансляціях.',
			layout: '(розкладка ENG US QWERTY)',
			play: 'Відтворення',
			pause: 'Пауза',
			prevFrameToast: 'Попередній кадр',
			nextFrameToast: 'Наступний кадр',
			theaterToast: 'Режим кінотеатру',
			miniplayerOn: 'Мініплеєр',
			miniplayerOff: 'Мініплеєр вимкнено',
			seconds: 'с',
			space: 'ПРОБІЛ',
			escape: 'ESC',
			shift: 'SHIFT'
		},
		be: {
			title: 'Спалучэнні клавіш',
			dismiss: 'Закрыць',
			playback: 'Прайграванне',
			general: 'Агульныя',
			captions: 'Субцітры',
			togglePlay: 'Прайграць/прыпыніць',
			rewind10: 'Перамотаць назад на 10 секунд',
			forward10: 'Перамотаць наперад на 10 секунд',
			rewind5: 'Перамотаць назад на 5 секунд',
			forward5: 'Перамотаць наперад на 5 секунд',
			prevFrame: 'Папярэдні кадр (на паўзе)',
			nextFrame: 'Наступны кадр (на паўзе)',
			slower: 'Паменшыць хуткасць прайгравання',
			faster: 'Павялічыць хуткасць прайгравання',
			seekPercent: 'Перайсці да пэўнага моманту відэа (7 — да 70% працягласці)',
			fullscreen: 'Уключыць/выключыць поўнаэкранны рэжым',
			theater: 'Уключыць/выключыць рэжым кінатэатра',
			fillWindow: 'Уключыць/выключыць рэжым «на ўсё акно»',
			miniplayer: 'Уключыць/выключыць мініпрайгравальнік',
			closeDialog: 'Закрыць мініпрайгравальнік або бягучае акно',
			mute: 'Уключыць/выключыць гук',
			volume: 'Павялічыць / паменшыць гучнасць',
			shortcuts: 'Паказаць/схаваць спалучэнні клавіш',
			captionsToggle: 'Уключыць/выключыць субцітры, калі яны ёсць',
			note: 'Перамотка, хуткасць, пакадравы пераход і пераход па працэнтах не працуюць у прамых трансляцыях.',
			layout: '(раскладка ENG US QWERTY)',
			play: 'Прайграванне',
			pause: 'Паўза',
			prevFrameToast: 'Папярэдні кадр',
			nextFrameToast: 'Наступны кадр',
			theaterToast: 'Рэжым кінатэатра',
			miniplayerOn: 'Мініпрайгравальнік',
			miniplayerOff: 'Мініпрайгравальнік выключаны',
			seconds: 'с',
			space: 'ПРАБЕЛ',
			escape: 'ESC',
			shift: 'SHIFT'
		},
		kk: {
			title: 'Пернелер тіркесімдері',
			dismiss: 'Жабу',
			playback: 'Ойнату',
			general: 'Жалпы',
			captions: 'Субтитрлер',
			togglePlay: 'Ойнату/кідірту',
			rewind10: '10 секунд артқа айналдыру',
			forward10: '10 секунд алға айналдыру',
			rewind5: '5 секунд артқа айналдыру',
			forward5: '5 секунд алға айналдыру',
			prevFrame: 'Алдыңғы кадр (кідіртілгенде)',
			nextFrame: 'Келесі кадр (кідіртілгенде)',
			slower: 'Ойнату жылдамдығын азайту',
			faster: 'Ойнату жылдамдығын арттыру',
			seekPercent: 'Бейненің белгілі бір сәтіне өту (7 ұзақтықтың 70%-ына өтеді)',
			fullscreen: 'Толық экранды қосу/өшіру',
			theater: 'Кинотеатр режимін қосу/өшіру',
			fillWindow: '«Бүкіл терезеге» режимін қосу/өшіру',
			miniplayer: 'Шағын ойнатқышты қосу/өшіру',
			closeDialog: 'Шағын ойнатқышты немесе ағымдағы терезені жабу',
			mute: 'Дыбысты қосу/өшіру',
			volume: 'Дыбыс деңгейін арттыру / азайту',
			shortcuts: 'Пернелер тіркесімдерін көрсету/жасыру',
			captionsToggle: 'Бейнеде субтитр болса, оны қосу/өшіру',
			note: 'Тікелей эфирде айналдыру, жылдамдық, кадр және пайыз пернелері жұмыс істемейді.',
			layout: '(ENG US QWERTY орналасуы)',
			play: 'Ойнату',
			pause: 'Кідірту',
			prevFrameToast: 'Алдыңғы кадр',
			nextFrameToast: 'Келесі кадр',
			theaterToast: 'Кинотеатр режимі',
			miniplayerOn: 'Шағын ойнатқыш',
			miniplayerOff: 'Шағын ойнатқыш өшірілді',
			seconds: 'с',
			space: 'БОС ОРЫН',
			escape: 'ESC',
			shift: 'SHIFT'
		},
		fi: {
			title: 'Pikanäppäimet',
			dismiss: 'Sulje',
			playback: 'Toisto',
			general: 'Yleiset',
			captions: 'Tekstitykset',
			togglePlay: 'Toista/keskeytä',
			rewind10: 'Kelaa taaksepäin 10 sekuntia',
			forward10: 'Kelaa eteenpäin 10 sekuntia',
			rewind5: 'Kelaa taaksepäin 5 sekuntia',
			forward5: 'Kelaa eteenpäin 5 sekuntia',
			prevFrame: 'Edellinen ruutu (kun keskeytetty)',
			nextFrame: 'Seuraava ruutu (kun keskeytetty)',
			slower: 'Hidasta toistonopeutta',
			faster: 'Nopeuta toistoa',
			seekPercent: 'Siirry tiettyyn kohtaan videossa (7 siirtyy 70 %:iin kestosta)',
			fullscreen: 'Koko näyttö päälle/pois',
			theater: 'Teatteritila päälle/pois',
			fillWindow: 'Ikkunan täyttö päälle/pois',
			miniplayer: 'Minisoitin päälle/pois',
			closeDialog: 'Sulje minisoitin tai nykyinen valintaikkuna',
			mute: 'Mykistys päälle/pois',
			volume: 'Äänenvoimakkuus ylös / alas',
			shortcuts: 'Näytä/piilota pikanäppäimet',
			captionsToggle: 'Tekstitykset päälle/pois, jos videossa on niitä',
			note: 'Kelaus-, nopeus-, ruutu- ja prosenttinäppäimet eivät toimi suorissa lähetyksissä.',
			layout: '(US QWERTY -asettelu)',
			play: 'Toista',
			pause: 'Tauko',
			prevFrameToast: 'Edellinen ruutu',
			nextFrameToast: 'Seuraava ruutu',
			theaterToast: 'Teatteritila',
			miniplayerOn: 'Minisoitin',
			miniplayerOff: 'Minisoitin pois',
			seconds: 's',
			space: 'VÄLILYÖNTI',
			escape: 'ESC',
			shift: 'VAIHTO'
		},
		pl: {
			title: 'Skróty klawiszowe',
			dismiss: 'Zamknij',
			playback: 'Odtwarzanie',
			general: 'Ogólne',
			captions: 'Napisy',
			togglePlay: 'Odtwórz/wstrzymaj',
			rewind10: 'Przewiń do tyłu o 10 sekund',
			forward10: 'Przewiń do przodu o 10 sekund',
			rewind5: 'Przewiń do tyłu o 5 sekund',
			forward5: 'Przewiń do przodu o 5 sekund',
			prevFrame: 'Poprzednia klatka (podczas pauzy)',
			nextFrame: 'Następna klatka (podczas pauzy)',
			slower: 'Zmniejsz szybkość odtwarzania',
			faster: 'Zwiększ szybkość odtwarzania',
			seekPercent: 'Przejdź do określonego miejsca w filmie (7 przechodzi do 70% czasu trwania)',
			fullscreen: 'Włącz/wyłącz pełny ekran',
			theater: 'Włącz/wyłącz tryb kinowy',
			fillWindow: 'Włącz/wyłącz wypełnienie okna',
			miniplayer: 'Włącz/wyłącz miniodtwarzacz',
			closeDialog: 'Zamknij miniodtwarzacz lub bieżące okno',
			mute: 'Włącz/wyłącz wyciszenie',
			volume: 'Zwiększ / zmniejsz głośność',
			shortcuts: 'Pokaż/ukryj skróty klawiszowe',
			captionsToggle: 'Włącz/wyłącz napisy, jeśli film je obsługuje',
			note: 'Klawisze przewijania, szybkości, klatek i procentów nie działają podczas transmisji na żywo.',
			layout: '(układ US QWERTY)',
			play: 'Odtwórz',
			pause: 'Pauza',
			prevFrameToast: 'Poprzednia klatka',
			nextFrameToast: 'Następna klatka',
			theaterToast: 'Tryb kinowy',
			miniplayerOn: 'Miniodtwarzacz',
			miniplayerOff: 'Miniodtwarzacz wyłączony',
			seconds: 's',
			space: 'SPACJA',
			escape: 'ESC',
			shift: 'SHIFT'
		},
		zh: {
			title: '键盘快捷键',
			dismiss: '关闭',
			playback: '播放',
			general: '常规',
			captions: '字幕',
			togglePlay: '播放/暂停',
			rewind10: '后退 10 秒',
			forward10: '快进 10 秒',
			rewind5: '后退 5 秒',
			forward5: '快进 5 秒',
			prevFrame: '上一帧（暂停时）',
			nextFrame: '下一帧（暂停时）',
			slower: '降低播放速度',
			faster: '提高播放速度',
			seekPercent: '跳转到视频中的特定位置（按 7 跳转到时长的 70%）',
			fullscreen: '开启/关闭全屏',
			theater: '开启/关闭影院模式',
			fillWindow: '开启/关闭填满窗口',
			miniplayer: '开启/关闭迷你播放器',
			closeDialog: '关闭迷你播放器或当前对话框',
			mute: '开启/关闭静音',
			volume: '调高 / 调低音量',
			shortcuts: '显示/隐藏键盘快捷键',
			captionsToggle: '如果视频有字幕，开启/关闭字幕',
			note: '直播时，跳转、速度、逐帧和百分比按键不起作用。',
			layout: '（美式 QWERTY 键盘布局）',
			play: '播放',
			pause: '暂停',
			prevFrameToast: '上一帧',
			nextFrameToast: '下一帧',
			theaterToast: '影院模式',
			miniplayerOn: '迷你播放器',
			miniplayerOff: '已关闭迷你播放器',
			seconds: '秒',
			space: '空格键',
			escape: 'ESC',
			shift: 'SHIFT'
		},
		ja: {
			title: 'キーボード ショートカット',
			dismiss: '閉じる',
			playback: '再生',
			general: '全般',
			captions: '字幕',
			togglePlay: '再生/一時停止',
			rewind10: '10 秒戻る',
			forward10: '10 秒進む',
			rewind5: '5 秒戻る',
			forward5: '5 秒進む',
			prevFrame: '前のフレーム（一時停止中）',
			nextFrame: '次のフレーム（一時停止中）',
			slower: '再生速度を下げる',
			faster: '再生速度を上げる',
			seekPercent: '動画の特定の位置に移動（7 で再生時間の 70% に移動）',
			fullscreen: '全画面表示のオン/オフ',
			theater: 'シアターモードのオン/オフ',
			fillWindow: 'ウィンドウ全体表示のオン/オフ',
			miniplayer: 'ミニプレーヤーのオン/オフ',
			closeDialog: 'ミニプレーヤーまたは現在のダイアログを閉じる',
			mute: 'ミュートのオン/オフ',
			volume: '音量を上げる / 下げる',
			shortcuts: 'キーボード ショートカットの表示/非表示',
			captionsToggle: '字幕がある場合、字幕のオン/オフ',
			note: 'ライブ配信では、シーク、速度、フレーム、パーセントのキーは無効です。',
			layout: '（US QWERTY 配列）',
			play: '再生',
			pause: '一時停止',
			prevFrameToast: '前のフレーム',
			nextFrameToast: '次のフレーム',
			theaterToast: 'シアターモード',
			miniplayerOn: 'ミニプレーヤー',
			miniplayerOff: 'ミニプレーヤーをオフ',
			seconds: '秒',
			space: 'スペース',
			escape: 'ESC',
			shift: 'SHIFT'
		}
	};

	// First supported language from the browser's preferred list, matched on the base tag (pt-BR -> pt, zh-TW -> zh).
	function pickLanguage() {
		const preferred =
			navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
		for (const tag of preferred) {
			const base = String(tag || '')
				.toLowerCase()
				.split('-')[0];
			if (Object.hasOwn(STRINGS, base)) {
				return base;
			}
		}
		return 'en';
	}

	const LANG = pickLanguage();
	const T = STRINGS[LANG];

	// Key cells may name keys as {space}, {escape} or {shift}; they are replaced with the localised key name.
	function keyText(template) {
		return template.replace(/\{(\w+)\}/g, (_, name) => T[name]);
	}

	// The player's own keys are listed too, so the overlay shows everything that works on the player.
	const SHORTCUT_SECTIONS = [
		{
			title: 'playback',
			rows: [
				['togglePlay', '{space}'],
				['rewind10', 'j'],
				['togglePlay', 'k'],
				['forward10', 'l'],
				['rewind5', '←'],
				['forward5', '→'],
				['prevFrame', ','],
				['nextFrame', '.'],
				['slower', '< ({shift}+,)'],
				['faster', '> ({shift}+.)'],
				['seekPercent', '0..9']
			]
		},
		{
			title: 'general',
			rows: [
				['fullscreen', 'f'],
				['theater', 't'],
				['fillWindow', 'w'],
				['miniplayer', 'i'],
				['closeDialog', '{escape}'],
				['mute', 'm'],
				['volume', '↑ / ↓'],
				['shortcuts', '? ({shift}+/)']
			]
		},
		{
			title: 'captions',
			rows: [['captionsToggle', 'c']]
		}
	];
	const SHORTCUTS_CSS = `
		:host { all: initial; }
		.backdrop {
			position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
			background: rgba(0, 0, 0, 0.5); font: 400 16px/1.4 Roboto, -apple-system, system-ui, sans-serif;
		}
		.card {
			box-sizing: border-box; width: min(1850px, 94vw); max-height: 92vh;
			display: flex; flex-direction: column;
			padding: 24px 24px 16px 24px; border-radius: 12px; background: #fff; color: #0f0f0f;
			box-shadow: 0 4px 32px rgba(0, 0, 0, 0.3);
		}
		h2 { margin: 4px 12px 16px 12px; font-size: 30px; font-weight: 700; }
		h2 .layout { font-size: 14px; font-weight: 400; color: #909090; }
		/* Only the sections scroll, so the Dismiss button stays visible in short windows. */
		.sections {
			display: grid; grid-template-columns: 1fr 1fr; align-items: start; column-gap: 48px; row-gap: 32px;
			min-height: 0; overflow: auto;
		}
		h3 {
			margin: 0; padding: 12px; border-bottom: 1px solid #ddd;
			font-size: 15px; font-weight: 500; text-transform: uppercase; color: #333;
		}
		.row { display: grid; grid-template-columns: 3fr 1fr; gap: 16px; padding: 9px 12px; border-bottom: 1px solid #ddd; color: #333; }
		.keys { font-family: ui-monospace, Menlo, Consolas, monospace; color: #0f0f0f; white-space: nowrap; }
		.footer { display: flex; align-items: center; gap: 24px; justify-content: space-between; margin-top: 24px; padding: 0 12px; }
		.note { font-size: 14px; color: #606060; }
		button {
			padding: 8px 12px; border: 0; border-radius: 18px; background: none;
			font-family: inherit; font-size: 18px; font-weight: 500; color: #065fd4; cursor: pointer;
		}
		button:hover { background: #def1ff; }
		@media (max-width: 800px) { .sections { grid-template-columns: 1fr; } }
	`;

	/*
	 * Same rule as the player's own hotkeys: they work while the player holds focus or nothing does, so typing in the
	 * comment box, chat or search, or pressing Space on a focused button, never reaches the player.
	 */
	function playerHasFocus() {
		const el = document.activeElement;
		return !el || el === document.body || el.closest(WRAPPER_SELECTOR) !== null;
	}

	function activeVideo() {
		const videos = Array.from(document.querySelectorAll('video'));
		return videos.find(v => v.readyState > 0) || videos[0] || null;
	}

	// IVS live streams report an infinite duration; the player itself disables seek and speed for them.
	function isLive(video) {
		return video.duration === Infinity || /\/live\//.test(location.pathname);
	}

	function isInPip(video) {
		return document.pictureInPictureElement === video || video.webkitPresentationMode === 'picture-in-picture';
	}

	let toastEl = null;
	let toastTimer = null;

	function toast(video, text) {
		const host = document.fullscreenElement || document.webkitFullscreenElement || document.body;
		if (!toastEl) {
			toastEl = document.createElement('div');
			toastEl.className = 'kifty-toast';
			Object.assign(toastEl.style, {
				position: 'fixed',
				transform: 'translateX(-50%)',
				padding: '6px 14px',
				borderRadius: '6px',
				background: 'rgba(0, 0, 0, 0.65)',
				color: '#fff',
				font: '600 15px/1.2 -apple-system, system-ui, sans-serif',
				pointerEvents: 'none',
				zIndex: TOP_Z_INDEX,
				transition: 'opacity 0.2s',
				opacity: '0'
			});
		}
		if (toastEl.parentElement !== host) {
			host.appendChild(toastEl);
		}
		const rect = video.getBoundingClientRect();
		toastEl.style.left = rect.left + rect.width / 2 + 'px';
		toastEl.style.top = rect.top + rect.height * 0.12 + 'px';
		toastEl.textContent = text;
		toastEl.style.opacity = '1';
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastEl.style.opacity = '0';
		}, TOAST_MS);
	}

	function clampTime(video, time) {
		const max = isFinite(video.duration) ? video.duration : Infinity;
		return Math.min(max, Math.max(0, time));
	}

	function seek(video, delta) {
		video.currentTime = clampTime(video, video.currentTime + delta);
		toast(video, (delta > 0 ? '+' : '-') + Math.abs(delta) + ' ' + T.seconds);
	}

	function seekToFraction(video, fraction) {
		if (!isFinite(video.duration)) {
			return false;
		}
		video.currentTime = video.duration * fraction;
		toast(video, Math.round(fraction * 100) + '%');
		return true;
	}

	// Frames are stepped only while paused; a step during playback would be lost immediately.
	function stepFrame(video, direction) {
		if (!video.paused) {
			return false;
		}
		video.currentTime = clampTime(video, video.currentTime + direction * FRAME_SECONDS);
		toast(video, direction > 0 ? T.nextFrameToast : T.prevFrameToast);
		return true;
	}

	function togglePlay(video) {
		if (video.paused || video.ended) {
			const p = video.play();
			if (p && typeof p.catch === 'function') {
				p.catch(() => {});
			}
			toast(video, T.play);
		} else {
			video.pause();
			toast(video, T.pause);
		}
	}

	function stepSpeed(video, direction) {
		const current = SPEEDS.indexOf(video.playbackRate);
		const index = current < 0 ? SPEEDS.indexOf(1) : current;
		const next = Math.min(SPEEDS.length - 1, Math.max(0, index + direction));
		video.playbackRate = SPEEDS[next];
		toast(video, SPEEDS[next] + 'x');
	}

	/*
	 * Relayed to the player's own handler instead of changing layout directly, so its fill-window state stays in sync.
	 * Dispatching on the wrapper reaches the React handler, which stops propagation before the site's window listener.
	 */
	function relayToPlayer(video, key) {
		const target = video.closest(WRAPPER_SELECTOR) || document.querySelector(WRAPPER_SELECTOR);
		if (!target) {
			return false;
		}
		target.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}));
		return true;
	}

	function toggleTheater(video) {
		if (!relayToPlayer(video, PLAYER_FILL_WINDOW_KEY)) {
			return false;
		}
		toast(video, T.theaterToast);
		return true;
	}

	function exitPip(video) {
		if (document.pictureInPictureElement && typeof document.exitPictureInPicture === 'function') {
			document.exitPictureInPicture().catch(() => {});
		} else if (typeof video.webkitSetPresentationMode === 'function') {
			video.webkitSetPresentationMode('inline');
		}
		toast(video, T.miniplayerOff);
	}

	function togglePip(video) {
		if (isInPip(video)) {
			exitPip(video);
			return true;
		}
		if (typeof video.requestPictureInPicture === 'function') {
			video.requestPictureInPicture().catch(() => {});
		} else if (typeof video.webkitSetPresentationMode === 'function') {
			video.webkitSetPresentationMode('picture-in-picture');
		} else {
			return false;
		}
		toast(video, T.miniplayerOn);
		return true;
	}

	let shortcutsEl = null;

	function el(tag, className, text) {
		const node = document.createElement(tag);
		if (className) {
			node.className = className;
		}
		if (text) {
			node.textContent = text;
		}
		return node;
	}

	// Rendered in a shadow root so the site's stylesheets cannot restyle the overlay.
	function buildShortcutsOverlay() {
		const host = el('div', 'kifty-shortcuts');
		host.lang = LANG;
		Object.assign(host.style, {position: 'fixed', inset: '0', zIndex: TOP_Z_INDEX});
		const root = host.attachShadow({mode: 'open'});
		const style = el('style');
		style.textContent = SHORTCUTS_CSS;
		const backdrop = el('div', 'backdrop');
		const card = el('div', 'card');
		card.setAttribute('role', 'dialog');
		card.setAttribute('aria-label', T.title);
		const heading = el('h2', null, T.title + ' ');
		// Hotkeys follow the physical US QWERTY keys whatever layout is active, so the title says which keys are meant.
		heading.appendChild(el('span', 'layout', T.layout));
		card.appendChild(heading);
		const sections = el('div', 'sections');
		for (const section of SHORTCUT_SECTIONS) {
			const sectionEl = el('section');
			sectionEl.appendChild(el('h3', null, T[section.title]));
			for (const [label, keys] of section.rows) {
				const row = el('div', 'row');
				row.appendChild(el('span', 'label', T[label]));
				row.appendChild(el('span', 'keys', keyText(keys)));
				sectionEl.appendChild(row);
			}
			sections.appendChild(sectionEl);
		}
		card.appendChild(sections);
		const footer = el('div', 'footer');
		footer.appendChild(el('span', 'note', T.note));
		const dismiss = el('button', null, T.dismiss);
		dismiss.type = 'button';
		dismiss.addEventListener('click', hideShortcuts);
		footer.appendChild(dismiss);
		card.appendChild(footer);
		backdrop.appendChild(card);
		backdrop.addEventListener('click', event => {
			if (event.target === backdrop) {
				hideShortcuts();
			}
		});
		root.append(style, backdrop);
		return host;
	}

	function shortcutsOpen() {
		return shortcutsEl !== null && shortcutsEl.isConnected;
	}

	function hideShortcuts() {
		if (shortcutsEl) {
			shortcutsEl.remove();
		}
	}

	function toggleShortcuts() {
		if (shortcutsOpen()) {
			hideShortcuts();
			return;
		}
		if (!shortcutsEl) {
			shortcutsEl = buildShortcutsOverlay();
		}
		(document.fullscreenElement || document.webkitFullscreenElement || document.body).appendChild(shortcutsEl);
	}

	function onKeyDown(event) {
		if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
			return;
		}
		/*
		 * Hotkeys are physical keys (event.code) as on a US QWERTY keyboard, whatever layout is active, so Shift+Slash is
		 * the shortcuts key even where the other layout has differenty key there. Keys not listed here do nothing, whatever they
		 * type. Numpad digits are left out because with Num Lock off the same keys are arrows, which the player already
		 * uses for seeking.
		 */
		const combo = (event.shiftKey ? 'Shift+' : '') + event.code;
		// Escape closes the overlay wherever focus is, like any dialog.
		if (combo === 'Escape' && shortcutsOpen()) {
			hideShortcuts();
			event.preventDefault();
			return;
		}
		if (!playerHasFocus()) {
			return;
		}
		// Handled before the video lookup so the overlay also opens on pages without a player.
		if (combo === 'Shift+Slash') {
			toggleShortcuts();
			event.preventDefault();
			return;
		}
		const video = activeVideo();
		if (!video) {
			return;
		}
		const live = isLive(video);
		let handled = true;
		switch (combo) {
			case 'KeyK':
				togglePlay(video);
				break;
			case 'KeyJ':
				handled = !live;
				if (handled) {
					seek(video, -SEEK_SECONDS);
				}
				break;
			case 'KeyL':
				handled = !live;
				if (handled) {
					seek(video, SEEK_SECONDS);
				}
				break;
			case 'Comma':
				handled = !live && stepFrame(video, -1);
				break;
			case 'Period':
				handled = !live && stepFrame(video, 1);
				break;
			case 'Shift+Comma':
				handled = !live;
				if (handled) {
					stepSpeed(video, -1);
				}
				break;
			case 'Shift+Period':
				handled = !live;
				if (handled) {
					stepSpeed(video, 1);
				}
				break;
			case 'KeyT':
				handled = toggleTheater(video);
				break;
			case 'KeyI':
				handled = togglePip(video);
				break;
			case 'Escape':
				handled = isInPip(video);
				if (handled) {
					exitPip(video);
				}
				break;
			default: {
				const digit = /^Digit([0-9])$/.exec(combo);
				if (digit) {
					handled = !live && seekToFraction(video, Number(digit[1]) / 10);
				} else {
					// The player matches event.key, so it already handles these when the layout types the same letter.
					const playerKey = Object.hasOwn(PLAYER_KEYS, combo) ? PLAYER_KEYS[combo] : null;
					handled =
						playerKey !== null && event.key.toLowerCase() !== playerKey && relayToPlayer(video, playerKey);
				}
				break;
			}
		}
		if (handled) {
			event.preventDefault();
		}
	}

	// Capture phase so the keys work even when the player wrapper holds focus.
	window.addEventListener('keydown', onKeyDown, true);
})();
