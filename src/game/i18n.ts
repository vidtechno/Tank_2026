/**
 * Steel Front: Tank Defense
 * Multi-Language Translations (Uzbek, English, Russian)
 */

export type Language = 'uz' | 'en' | 'ru';

export interface PowerUpDoc {
  name: string;
  icon: string;
  desc: string;
}

export interface EnemyDoc {
  name: string;
  badge: string;
  color: string;
  desc: string;
}

export interface TranslationData {
  title: string;
  subtitle: string;
  tagline: string;
  briefing: string;
  startGame: string;
  missionSelect: string;
  intelAndCrates: string;
  resumeGame: string;
  restartSector: string;
  abortToMenu: string;
  sector: string;
  score: string;
  best: string;
  core: string;
  armor: string;
  lives: string;
  hostiles: string;
  autoCannon: string;
  ready: string;
  firing: string;
  unitCompromised: string;
  reinforcing: string;
  sectorSecured: string;
  advanceSector: string;
  missionFailed: string;
  retrySector: string;
  returnToMenu: string;
  campaignComplete: string;
  campaignVictoryMsg: string;
  totalKills: string;
  totalVictories: string;
  highestSector: string;
  backToHQ: string;
  intelTitle: string;
  intelSubtitle: string;
  cratesTitle: string;
  cratesSubtitle: string;
  controlsTitle: string;
  controlsDesc: string;
  desktopControls: string;
  mobileControls: string;
  autoFireDesc: string;
  reinforcedArmorTitle: string;
  reinforcedArmorDesc: string;
  hostilesTitle: string;
  crates: PowerUpDoc[];
  enemies: EnemyDoc[];
}

export const TRANSLATIONS: Record<Language, TranslationData> = {
  uz: {
    title: 'STEEL FRONT',
    subtitle: 'TANK DEFENSE',
    tagline: 'Klassik Tank 1990 Zamonamiy Versiyada',
    briefing: 'Elita jangovar tankni boshqaring. Bosh qo\'mondonlik bazasini (Command Core) himoya qiling, dushman armiyasini yo\'q qiling va barcha 6 ta sektor ustidan g\'alaba qozoning!',
    startGame: 'O\'YINNI BOSHLASH',
    missionSelect: 'BOSQICHNI TANLASH',
    intelAndCrates: 'TAKTIK QUTILAR VA YO\'RIQNOMA',
    resumeGame: 'JANGNI DAVOM ETTIRISH',
    restartSector: 'QAYTA BOSHLASH',
    abortToMenu: 'BOSH SAHIFAGA QAYTISH',
    sector: 'SEKTOR',
    score: 'OCHKO',
    best: 'REKORD',
    core: 'BAZA',
    armor: 'ZIRH',
    lives: 'JON',
    hostiles: 'DUSHMANLAR',
    autoCannon: 'AVTO-TO\'P (1/s)',
    ready: 'TAYYOR',
    firing: 'OTMOQDA',
    unitCompromised: 'TANK ZARARLANDI',
    reinforcing: 'QAYTA TIKLANMOQDA',
    sectorSecured: 'SEKTOR TOZALANDI!',
    advanceSector: 'KEYINGI SEKTORGA O\'TISH',
    missionFailed: 'MISSIYA MAG\'LUB BO\'LDI',
    retrySector: 'QAYTA URINISH',
    returnToMenu: 'BOSH SAHIFAGA QAYTISH',
    campaignComplete: 'G\'ALABA! KAMPANIYA YAKUNLANDI!',
    campaignVictoryMsg: 'Tabriklaymiz, Qo\'mondon! Barcha dushman zirhli diviziyalari tor-mor etildi va Bosh Qo\'mondonlik Bazasi omon qoldi.',
    totalKills: 'Yo\'q qilingan dushmanlar',
    totalVictories: 'To\'liq g\'alabalar soni',
    highestSector: 'Ochilgan sektor',
    backToHQ: 'BOSH MENYUGA QAYTISH',
    intelTitle: 'TAKTIK YO\'RIQNOMA & QUTILAR',
    intelSubtitle: 'Taktik qutilar nima berishi, dushman turlari va tank boshqaruvi.',
    cratesTitle: '🎁 JANGOVAR TAKTIK QUTILAR',
    cratesSubtitle: 'Yo\'q qilingan dushmanlardan tushadigan bonusli taktik qutilar:',
    controlsTitle: '🎮 BOSHQARUV VA OTISH',
    controlsDesc: 'Tank harakatlanishi va qurol tizimlari:',
    desktopControls: 'Kompyuterda: WASD yoki Strelka tugmalari orqali harakatlanish. P — to\'xtatish (Pause), R — qayta boshlash.',
    mobileControls: 'Telefonda: Ekranning pastki qismidagi sezgir D-Pad tugmalari orqali.',
    autoFireDesc: 'Avtomatik otish: Tankingiz har soniyada 1 ta o\'qni o\'zi avtomatik otadi (qo\'lda tugma bosish shart emas!).',
    reinforcedArmorTitle: '🛡️ MUSTAHKAM ZIRH (2 TA ZARBA)',
    reinforcedArmorDesc: 'Sizning tankingiz 1 ta o\'q zarbasiga emas, 2 ta to\'g\'ridan-to\'g\'ri dushman o\'qiga chidaydi (1-zarbada zirh buziladi, 2-zarbada portlaydi).',
    hostilesTitle: '⚔️ DUSHMAN TANKLARI',
    crates: [
      {
        name: 'Titan Qalqoni (Titan Shield)',
        icon: '🛡️',
        desc: '10 soniya davomida tankni dushman snaryadlaridan to\'liq asraydigan o\'tib bo\'lmas energiya qalqoni.'
      },
      {
        name: 'Vaqtni To\'xtatish (Time Freeze)',
        icon: '❄️',
        desc: '8 soniya davomida barcha dushman tanklarini butunlay muzlatadi, harakat va o\'q otishini to\'xtatadi.'
      },
      {
        name: 'Taktik Bomba (Tactical Nuke)',
        icon: '💣',
        desc: 'Xaritadagi barcha faol dushman tanklarini bir zumda kuchli portlash bilan yakson qiladi!'
      },
      {
        name: 'Po\'lat Istehkom (Steel Fortify)',
        icon: '🧱',
        desc: 'Bosh Baza (Command Core) atrofiga 20 soniya davomida o\'tib bo\'lmas po\'lat devorlar o\'rnatadi.'
      },
      {
        name: 'Ta\'mirlash To\'plami (Repair Kit)',
        icon: '➕',
        desc: 'Tankingiz zirhini to\'liq 2 HP ga qayta tiklaydi yoki tank zaxirasiga +1 qo\'shimcha jon beradi.'
      },
      {
        name: 'Tezkor To\'p (Rapid Cannon)',
        icon: '⚡',
        desc: '12 soniya davomida to\'p tezligini 2 barobar oshiradi (har soniyada 2 tadan o\'q otadi).'
      }
    ],
    enemies: [
      {
        name: 'Scout Tank (Kuzatuvchi)',
        badge: 'TEZKOR',
        color: '#cbd5e1',
        desc: 'Juda tez harakatlanuvchi kumush rangli tank. 1 ta zarbada yo\'q bo\'ladi (100 ochko).'
      },
      {
        name: 'Assault Tank (Hujumkor)',
        badge: 'STANDART',
        color: '#f87171',
        desc: 'Qizil rangli muvozanatli tank. 2 ta zarbada yo\'q bo\'ladi (200 ochko).'
      },
      {
        name: 'Heavy Armored (Og\'ir Zirhli)',
        badge: '4 HP ZIRH',
        color: '#38bdf8',
        desc: 'Moviy po\'lat zirhli gigant tank. 4 ta zarba talab qiladi (400 ochko).'
      },
      {
        name: 'Commander Tank (Aqlli Komandir)',
        badge: 'AQLLI AI',
        color: '#f43f5e',
        desc: 'Qizil-oltin rangli, bazaga to\'g\'ridan-to\'g\'ri yo\'l topib boruvchi va yo\'lidagi devorlarni o\'q bilan buzib o\'tuvchi aqlli tank! (500 ochko).'
      }
    ]
  },

  en: {
    title: 'STEEL FRONT',
    subtitle: 'TANK DEFENSE',
    tagline: 'Modern Tactical Tank Arcade',
    briefing: 'Take command of an elite battle tank. Defend your forward Command Core, exploit battlefield cover, and neutralize all hostile armor battalions across 6 tactical sectors!',
    startGame: 'START GAME',
    missionSelect: 'MISSION SELECT',
    intelAndCrates: 'TACTICAL CRATES & INTEL',
    resumeGame: 'RESUME COMBAT',
    restartSector: 'RESTART SECTOR',
    abortToMenu: 'ABORT TO MAIN MENU',
    sector: 'SECTOR',
    score: 'SCORE',
    best: 'BEST',
    core: 'CORE',
    armor: 'ARMOR',
    lives: 'LIVES',
    hostiles: 'HOSTILES',
    autoCannon: 'AUTO-CANNON (1/s)',
    ready: 'READY',
    firing: 'FIRING',
    unitCompromised: 'UNIT COMPROMISED',
    reinforcing: 'DEPLOYING SHIELD',
    sectorSecured: 'SECTOR SECURED!',
    advanceSector: 'ADVANCE TO NEXT SECTOR',
    missionFailed: 'MISSION FAILED',
    retrySector: 'RETRY SECTOR',
    returnToMenu: 'RETURN TO HQ MENU',
    campaignComplete: 'CAMPAIGN COMPLETE!',
    campaignVictoryMsg: 'Congratulations, Commander! All enemy armor divisions were repelled and the Command Core stands strong.',
    totalKills: 'Hostiles Destroyed',
    totalVictories: 'Campaign Victories',
    highestSector: 'Sector Unlocked',
    backToHQ: 'BACK TO HQ',
    intelTitle: 'TACTICAL INTEL & CRATES',
    intelSubtitle: 'Tactical field guide: Crate capabilities, hostile classes, and maneuvers.',
    cratesTitle: '🎁 TACTICAL POWER-UP CRATES',
    cratesSubtitle: 'Defeated hostiles drop dynamic crates with battlefield upgrades:',
    controlsTitle: '🎮 CONTROLS & WEAPON SYSTEMS',
    controlsDesc: 'Steering and automatic cannon mechanics:',
    desktopControls: 'Desktop: WASD or Arrow keys to steer. P — Pause combat, R — Restart sector.',
    mobileControls: 'Mobile: Responsive touch D-Pad at the bottom of the display.',
    autoFireDesc: 'Auto-Fire: Your tank automatically discharges exactly 1 cannon shell per second in facing direction.',
    reinforcedArmorTitle: '🛡️ REINFORCED HULL (2 HITS)',
    reinforcedArmorDesc: 'Your tank withstands 2 direct enemy shell hits before exploding (1st hit damages armor, 2nd hit destroys unit).',
    hostilesTitle: '⚔️ HOSTILE TANK CLASSIFICATIONS',
    crates: [
      {
        name: 'Titan Shield',
        icon: '🛡️',
        desc: '10 seconds of impenetrable spherical energy barrier deflecting all incoming enemy fire.'
      },
      {
        name: 'Time Freeze',
        icon: '❄️',
        desc: '8 seconds cryogenic field freezes all enemy tanks, locking tracks and weapon systems.'
      },
      {
        name: 'Tactical Nuke',
        icon: '💣',
        desc: 'Instant tactical detonation obliterating all active hostile armor units across the map!'
      },
      {
        name: 'Steel Fortify',
        icon: '🧱',
        desc: 'Envelops the Command Core in reinforced steel plating for 20 seconds of maximum protection.'
      },
      {
        name: 'Repair Kit',
        icon: '➕',
        desc: 'Restores tank hull back to full 2 HP armor, or awards +1 extra tank life.'
      },
      {
        name: 'Rapid Cannon',
        icon: '⚡',
        desc: 'Overcharges cannon rate-of-fire to 2 rounds per second for 12 seconds.'
      }
    ],
    enemies: [
      {
        name: 'Scout Tank',
        badge: 'FAST',
        color: '#cbd5e1',
        desc: 'High speed silver reconnaissance unit. Neutralized in 1 hit (100 pts).'
      },
      {
        name: 'Assault Tank',
        badge: 'STANDARD',
        color: '#f87171',
        desc: 'Red frontline assault unit with balanced armor. Requires 2 hits (200 pts).'
      },
      {
        name: 'Heavy Armored',
        badge: '4 HP ARMOR',
        color: '#38bdf8',
        desc: 'Heavily plated blue behemoth. Takes 4 direct cannon hits (400 pts).'
      },
      {
        name: 'Commander Smart Tank',
        badge: 'SMART AI',
        color: '#f43f5e',
        desc: 'Crimson-gold officer tank with aggressive AI that paths towards Command Core and blasts through walls! (500 pts).'
      }
    ]
  },

  ru: {
    title: 'STEEL FRONT',
    subtitle: 'TANK DEFENSE',
    tagline: 'Современная танковая аркада в стиле 1990',
    briefing: 'Примите командование элитным танком. Защитите передовой Штаб (Command Core), используйте укрытия и уничтожьте вражеские бронетанковые батальоны во всех 6 секторах!',
    startGame: 'НАЧАТЬ ИГРУ',
    missionSelect: 'ВЫБОР СЕКТОРА',
    intelAndCrates: 'ТАКТИЧЕСКИЙ ГИД И ЯЩИКИ',
    resumeGame: 'ПРОДОЛЖИТЬ БОЙ',
    restartSector: 'ПЕРЕЗАПУСК СЕКТОРА',
    abortToMenu: 'В ГЛАВНОЕ МЕНЮ',
    sector: 'СЕКТОР',
    score: 'ОЧКИ',
    best: 'РЕКОРД',
    core: 'ШТАБ',
    armor: 'БРОНЯ',
    lives: 'ЖИЗНИ',
    hostiles: 'ВРАГИ',
    autoCannon: 'АВТО-ПУШКА (1/с)',
    ready: 'ГОТОВ',
    firing: 'СТРЕЛЬБА',
    unitCompromised: 'БРОНЯ ПОВРЕЖДЕНА',
    reinforcing: 'РАЗВЕРТЫВАНИЕ ЩИТА',
    sectorSecured: 'СЕКТОР ЗАЧИЩЕН!',
    advanceSector: 'ПЕРЕЙТИ В СЛЕДУЮЩИЙ СЕКТОР',
    missionFailed: 'МИССИЯ ПРОВАЛЕНА',
    retrySector: 'ПОВТОРИТЬ',
    returnToMenu: 'В ГЛАВНОЕ МЕНЮ',
    campaignComplete: 'ПОБЕДА! КАМПАНИЯ ЗАВЕРШЕНА!',
    campaignVictoryMsg: 'Поздравляем, Командир! Все вражеские дивизии разгромлены, Штаб успешно защищён.',
    totalKills: 'Уничтожено танков',
    totalVictories: 'Успешных кампаний',
    highestSector: 'Открытый сектор',
    backToHQ: 'В ШТАБ',
    intelTitle: 'ТАКТИЧЕСКИЙ ГИД И ЯЩИКИ',
    intelSubtitle: 'Описание тактических бонусов, типов вражеских танков и управления.',
    cratesTitle: '🎁 ТАКТИЧЕСКИЕ ЯЩИКИ С БОНУСАМИ',
    cratesSubtitle: 'Из уничтоженных врагов выпадают ящики с мощными тактическими усилениями:',
    controlsTitle: '🎮 УПРАВЛЕНИЕ И СТРЕЛЬБА',
    controlsDesc: 'Механика маневрирования и автоматической стрельбы:',
    desktopControls: 'На компьютере: клавиши WASD или Стрелки для движения. P — Пауза, R — Перезапуск сектора.',
    mobileControls: 'На телефоне: удобный сенсорный D-Pad в нижней части экрана.',
    autoFireDesc: 'Автострельба: ваш танк стреляет автоматически ровно 1 раз в секунду в направлении взгляда.',
    reinforcedArmorTitle: '🛡️ УСИЛЕННАЯ БРОНЯ (2 ПОПАДАНИЯ)',
    reinforcedArmorDesc: 'Ваш танк выдерживает 2 прямых попадания вражеских снарядов (1-е попадание пробивает броню, 2-е уничтожает танк).',
    hostilesTitle: '⚔️ КЛАССЫ ВРАЖЕСКИХ ТАНКОВ',
    crates: [
      {
        name: 'Титановый Щит (Titan Shield)',
        icon: '🛡️',
        desc: '10 секунд непробиваемого сферического силового поля, отражающего любые вражеские выстрелы.'
      },
      {
        name: 'Заморозка Времени (Time Freeze)',
        icon: '❄️',
        desc: '8 секунд криогенного поля: все вражеские танки замирают, их орудия блокируются.'
      },
      {
        name: 'Тактический Ядерный Удар (Tactical Nuke)',
        icon: '💣',
        desc: 'Мгновенно уничтожает абсолютно все активные танки противника на поле боя!'
      },
      {
        name: 'Стальное Укрепление (Steel Fortify)',
        icon: '🧱',
        desc: 'Окружает Штаб (Command Core) неразрушимой стальной бронёй на 20 секунд.'
      },
      {
        name: 'Ремкомплект (Repair Kit)',
        icon: '➕',
        desc: 'Полностью восстанавливает броню танка до 2 HP или даёт +1 дополнительную жизнь.'
      },
      {
        name: 'Скорострельная Пушка (Rapid Cannon)',
        icon: '⚡',
        desc: 'Удваивает скорострельность до 2 выстрелов в секунду на 12 секунд.'
      }
    ],
    enemies: [
      {
        name: 'Scout Tank (Разведчик)',
        badge: 'СКОРОСТНОЙ',
        color: '#cbd5e1',
        desc: 'Быстрый серебристый танк разведки. Уничтожается с 1 попадания (100 очков).'
      },
      {
        name: 'Assault Tank (Штурмовой)',
        badge: 'СТАНДАРТ',
        color: '#f87171',
        desc: 'Красный штурмовой танк со средней бронёй. Требует 2 попадания (200 очков).'
      },
      {
        name: 'Heavy Armored (Тяжёлый Броневик)',
        badge: '4 HP БРОНЯ',
        color: '#38bdf8',
        desc: 'Синий бронированный гигант. Требует 4 прямых попадания (400 очков).'
      },
      {
        name: 'Commander Tank (Командирский)',
        badge: 'УМНЫЙ AI',
        color: '#f43f5e',
        desc: 'Красно-золотой командирский танк: целенаправленно прорывается к Штабу и пробивает стены выстрелами! (500 очков).'
      }
    ]
  }
};
