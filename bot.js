const Telegraf = require('telegraf');
const {
    Extra,
    Markup
} = require('telegraf');

const config = require('./config.js');
const handler = require('./src/ticket_handler.js');
const cache = require('./src/cache.js');
const dbhandler = require('./src/dbhandler.js');
const session = require('telegraf/session');
const dateformat = require('dateformat')
const usernamebot = '@bmonitoringbot' //ganti atau sesuaikan dengan username bot kamu
process.env.TZ = 'Asia/Jakarta'

const dataService = require('./dataService');
const bot = new Telegraf(config.bot_token);


// eslint-disable-next-line new-cap
cache.html = Extra.HTML();
cache.markdown = Extra.markdown();
cache.noSound = Extra
// eslint-disable-next-line new-cap
    .HTML().notifications(false);

bot.use(session());
bot.use((ctx, next) => {
  ctx.getChat().then(function(chat) {
    if (chat.type === 'private') {
      ctx.session.admin = false;
      return next();
    } else {
      ctx.getChatAdministrators()
          .then(function(admins) {
            admins = JSON.stringify(admins);
            if (
              ctx.message.reply_to_message !== undefined &&
              admins.indexOf(ctx.from.id) > -1
            ) {
              // admin
              ctx.session.admin = true;
            } else {
              // no admin
              ctx.session.admin = false;
            }
            return next();
          });
    }
  });
});

const helpMsg = `Command reference:
/start - Start bot (mandatory in groups)
/inc - Increment default counter
/inc1 - Increment counter 1
/incx - Increment counter x (replace x with any number)
/dec - Decrement counter
/decx - Decrement counter x
/reset - Reset counter back to 0
/resetx - Reset counter x back to 0
/set y - Set counter to y [/set y]
/setx y - Set counter x to y [/setx y]
/get - Show current counter
/getx - Show value of counter x
/getall - Show all counters
/stop - Attemt to stop bot
/about - Show information about the bot
/help - Show this help page
Tip: You can also use e.g. '/inc2 5' to increase counter two by five counts.`;

const aboutMsg = "This bot was created by @LeoDJ\nSource code and contact information can be found at https://github.com/LeoDJ/telegram-counter-bot";

function getRegExp(command) {
    return new RegExp("/" + command + "[0-9]*\\b");
}

//get username for group command handling
bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
    console.log("Initialized", botInfo.username);
});

dataService.loadUsers();

function userString(ctx) {
    return JSON.stringify(ctx.from.id == ctx.chat.id ? ctx.from : {
        from: ctx.from,
        chat: ctx.chat
    });
}

function logMsg(ctx) {
    var from = userString(ctx);
    console.log('<', ctx.message.text, from)
}

function logOutMsg(ctx, text) {
    console.log('>', {
        id: ctx.chat.id
    }, text);
}

bot.command('broadcast', ctx => {
    if(ctx.from.id == config.adminChatId) {
        var words = ctx.message.text.split(' ');
        words.shift(); //remove first word (which ist "/broadcast")
        if(words.length == 0) //don't send empty message
            return;
        var broadcastMessage = words.join(' ');
        var userList = dataService.getUserList();
        console.log("Sending broadcast message to", userList.length, "users:  ", broadcastMessage);
        userList.forEach(userId => {
            console.log(">", {id: userId}, broadcastMessage);
            ctx.telegram.sendMessage(userId, broadcastMessage);
        });
    }
});

bot.command('bc', ctx => {
    if(ctx.from.id == config.adminChatId) {
        var words = ctx.message.text.split(' ');
        words.shift(); //remove first word (which ist "/broadcast")
        if(words.length == 0) //don't send empty message
            return;
        var broadcastMessage = words.join(' ');
        var userList = dataService.getUserList();
        console.log("Sending broadcast message to",userList.length, "users:  ",broadcastMessage, Extra .HTML()
        .markup((m) => m.inlineKeyboard([
        [m.urlButton('Start Bot', 'https://telegram.me/BMonitoringBot'),m.callbackButton('🇬🇧 English','English')]
        ])));
        userList.forEach(userId => {
            console.log(">", {id: userId},broadcastMessage, Extra .HTML()
            .markup((m) => m.inlineKeyboard([
            [m.urlButton('Start bot', 'https://telegram.me/BMonitoringBot'),m.callbackButton('🇬🇧 English','English')]
            ])));
            ctx.telegram.sendMessage(userId,broadcastMessage, Extra .HTML()
            .markup((m) => m.inlineKeyboard([
            [m.urlButton('Start Bot', 'https://telegram.me/BMonitoringBot'),m.callbackButton('🇬🇧 English','English')]
            ])));
        });
    }
});

bot.command('start', ctx => {
    logMsg(ctx);
    dataService.registerUser(ctx);
    var userid = ctx.from.id,
        pesan = `<b>🌏 Choose Language</b>\n`
                pesan += `•❂•─•─•❂•─•❂••❂•─•❂•─•─•❂•\n\n`
                pesan += `🆔 <b>Name:</b> ${ctx.from.first_name}\n`
                pesan += ` \u251c <b>Username:</b> @${ctx.from.username}\n`
                pesan += ` \u251c <b>ID Telegram:</b> <code>${userid}</code>\n`
                pesan += ` \u2514 <b>Link:</b> <a href="https://t.me/BmonitoringBotBot?start=${userid}">Click Here</a>\n\n`
                pesan += `👁‍🗨 Hello <b>${ctx.from.first_name}</b>, Welcome to <b>Bot Monitoring</b>\n<b>🌏 Please Choose your Language</b>\n\n`
                pesan += `•❂•─•─•❂•─•❂••❂•─•❂•─•─•❂•\n\n`

            ctx.replyWithPhoto("https://pics.me.me/choose-language-ii-no-your-language-help-with-the-translation-60857888.png",
            Extra.load({caption: `${pesan}`,
                parse_mode: 'HTML'
            }).markup((m) => m.inlineKeyboard([
                    [m.callbackButton('🇬🇧 English','English'),m.callbackButton('🇩🇪 Deutsch','Germany'),m.callbackButton('🇮🇩 Indonesian','Indonesian')],
                    [m.callbackButton('🇷🇺 Pусский','Russian'),m.callbackButton('🇮🇹 Italiano','Italy'),m.callbackButton('🇰🇷 한국어','Korean')],
                    [m.callbackButton('🇲🇾 Malay','Malaysian'),m.callbackButton('🇪🇦 Español','Spanish'),m.callbackButton('🇫🇷 France','France')],
                    [m.callbackButton('🇧🇷 Português','Brazilian'),m.callbackButton('🇵🇭 Tagalog','Philippines'),m.callbackButton('🇮🇳 हिन्दी','Hindi')],
                    [m.callbackButton('🇸🇦 العربية','Arabian'),m.callbackButton('🇯🇵 日本','Japan'),m.callbackButton('🇵🇱 Polska','Poland')]
                    ])
                ))
    logOutMsg(ctx, pesan);
});

bot.command('help', ctx => {
    logMsg(ctx);
    logOutMsg(ctx, helpMsg);
    ctx.reply(helpMsg);
});

bot.command('about', ctx => {
    logMsg(ctx);
    logOutMsg(ctx, aboutMsg);
    ctx.reply(aboutMsg);
});

bot.command('id', ({reply, from, chat}) => {
    reply(from.id + ' ' + chat.id);
  });
  
  bot.command('faq', (ctx) => {
    ctx.reply(config.faqCommandText, cache.html);
  });

  //CallBackButton
bot.on('callback_query', (ctx) => {
  switch(ctx.callbackQuery.data) {

  //
  //
  //Main Menu - CallBack
  //Bot Monitoring - By @manusii www.manusichro.me
  //
  //

  //English MainMenu
case 'English': case'MainMenuEN': case'BackToMMEN':
  {ctx.telegram.getMe() .then ((data)=>{
      var chatid = ctx.chat.id,
          userid = ctx.from.id,
          pesan = `🏠 <b>Main Menu</b>\n`
          pesan += `•❂•─•─•❂•─•❂••❂•─•❂•─•─•❂•\n\n`
          pesan += `👁‍🗨 Hello <b>${ctx.from.first_name}</b>, Welcome to <b>${data.first_name}</b>\n\n`
          pesan += `🆔 <b>Your Telegram Account</b>\n`
          pesan += ` \u251c <b>Name:</b> ${ctx.from.first_name}\n`
          pesan += ` \u251c <b>Username:</b> @${ctx.from.username}\n`
          pesan += ` \u2514 <b>ID Telegram:</b> <code>${userid}</code>\n\n`
          pesan += `•❂•─•─•❂•─•❂••❂•─•❂•─•─•❂•\n\n`
          Text = Extra.load({caption: `${pesan}`,
              parse_mode: 'HTML'
      }).markup((m) => m.inlineKeyboard([
              [m.callbackButton('📊 Monitoring Bot','📊 Monitoring Bot')], 
              [m.callbackButton('🎁 Bonus Section','BonusEN'), m.callbackButton('🚀 Our Sponsor', 'OurSponsorEN')],
              [m.callbackButton('🏆 20.000 Dogecoin Contests','20KContestsEN')], 
              [m.callbackButton('👥 About Us','AboutUsEN'), m.callbackButton('⚙️ Extra Menu', 'ExtraMenuEN')], 
          ]))

          ctx.replyWithPhoto("https://cdn.glitch.com/fdd099e5-3d19-4e49-8b92-76f88f14b6fb%2Fphoto_2020-06-06_00-31-46.jpg?v=1591378318942",
          Text)
  })
  }
  break;

//Monitoring English Area
case '📊 Monitoring Bot': case 'BackToBMonEN': 
  {ctx.telegram.getMe() .then ((data)=>{
      var pesan = `<b>📊 Monitoring Bot</b>\n`
          pesan += `•❂•─•─•❂•─•❂••❂•─•❂•─•─•❂•\n\n`
          pesan += `✅ <b>Advertising</b>✅\n`
          pesan += ` \u251c <i>Custom Your Ads In Here!!</i>\n`
          pesan += ` \u2514 <a href="https://t.me/bmonitoringsupportbot">Contact Admin</a>\n\n`
          pesan += `•❂•─•─•❂•─•❂••❂•─•❂•─•─•❂•\n\n`

  ctx.replyWithPhoto("http://portalbisnis.net/BMONBot/monbot.png",
      Extra.load({caption: `${pesan}`,
      parse_mode: 'HTML'
          }).markup((m) => m.inlineKeyboard([
          [m.callbackButton('🎰 Games Bot','GameBotEN'),m.callbackButton('🏦 Invest Bot','InvestBotEN'),m.callbackButton('🏆 Best Bot','BestBotEN')],
          [m.callbackButton('⛏ Mining Bot','MiningBotEN'),m.callbackButton('💰 CryptoAds Bot','CryptoAdsBotEN')],
          [m.callbackButton('🚰 Faucet And Invite Bot 🔗','Faucet&InviteBotEN')],
          [m.callbackButton('🔙 Back','BackToMMEN'),m.callbackButton('🏠 Main Menu','MainMenuEN')]
          ])
      ))
          })
              }
      break;

      

  }
      })
  
  // enable for groups (get own username)
  bot.telegram.getMe().then((botInfo) => {
    bot.options.username = botInfo.username;
  });
  
  // download photos
  const downloadPhotoMiddleware = (ctx, next) => {
    return bot.telegram.getFileLink(ctx.message.photo[0]).then((link) => {
      ctx.state.fileLink = link;
      return next();
    });
  };
  
  // download videos
  const downloadVideoMiddleware = (ctx, next) => {
    return bot.telegram.getFileLink(ctx.message.video).then((link) => {
      ctx.state.fileLink = link;
      return next();
    });
  };
  
  // download documents
  const downloadDocumentMiddleware = (ctx, next) => {
    console.log(ctx.message);
    return bot.telegram.getFileLink(ctx.message.document).then((link) => {
      ctx.state.fileLink = link;
      return next();
    });
  };
  
  // display open tickets
  bot.command('open', (ctx) => {
    ctx.getChat().then(function(chat) {
      if (chat.id.toString() === config.staffchat_id) {
        console.log('chatid', chat.id.toString());
        ctx.getChatAdministrators().then(function(admins) {
          admins = JSON.stringify(admins);
          if (admins.indexOf(ctx.from.id) > -1) {
            dbhandler.open(function(userList) {
              console.log(userList);
              let openTickets = '';
  
              for (const i in userList) {
                if (userList[i]['userid'] !== null &&
                    userList[i]['userid'] !== undefined) {
                  openTickets += '<code>#t' + userList[i]['userid']
                      .toString() + '</code>\n';
                }
              }
              setTimeout(function() {
                bot.telegram.sendMessage(
                    chat.id,
                    '<b>Open Tickets:\n\n</b>' + openTickets,
                    cache.noSound
                );
              }, 10);
            });
          }
        });
      }
    });
  });
  
  // close ticket
  bot.command('close', (ctx) => {
    ctx.getChat().then(function(chat) {
      if (chat.id.toString() === config.staffchat_id) {
        ctx.getChatAdministrators().then(function(admins) {
          admins = JSON.stringify(admins);
          if (
            ctx.message.reply_to_message !== undefined &&
            admins.indexOf(ctx.from.id) > -1
          ) {
            const replyText = ctx.message.reply_to_message.text;
            const userid = replyText.match(new RegExp('#t' + '(.*)' + ' ' +
                config.lang_from));
  
            dbhandler.add(userid[1], 'closed');
            bot.telegram.sendMessage(
                chat.id,
                'Ticket <code>#t'+userid[1]+'</code> closed',
                cache.noSound
            );
          }
        });
      }
    });
  });
  
  
  // ban user
  bot.command('ban', (ctx) => {
    ctx.getChat().then(function(chat) {
      if (chat.id.toString() === config.staffchat_id) {
        ctx.getChatAdministrators().then(function(admins) {
          admins = JSON.stringify(admins);
          if (
            ctx.message.reply_to_message !== undefined &&
            admins.indexOf(ctx.from.id) > -1
          ) {
            const replyText = ctx.message.reply_to_message.text;
            const userid = replyText.match(new RegExp('#t' + '(.*)' +
                ' ' + config.lang_from));
  
            dbhandler.add(userid[1], 'banned');
            bot.telegram.sendMessage(
                chat.id,
                config.lang_usr_with_ticket + ' <code>#t'+userid[1]+
                    '</code> ' + config.lang_banned,
                cache.noSound
            );
          }
        });
      }
    });
  });
  
  // handle photo input
  bot.on('photo', downloadPhotoMiddleware, (ctx, next) => {
    handler.file('photo', bot, ctx);
  });
  
  // handle video input
  bot.on('video', downloadVideoMiddleware, (ctx, next) => {
    handler.file('video', bot, ctx);
  });
  
  // handle file input
  bot.on('document', downloadDocumentMiddleware, (ctx, next) => {
    handler.file('document', bot, ctx);
  });
  
  bot.hears(/(.+)/, (ctx) => handler.ticket(bot, ctx));
  
  // telegraf error handling
bot.catch((err) => {
    console.log('Error: ', err);
  });

bot.telegram.setWebhook(`https://bmsupportbot.herokuapp.com/webhook`);
console.log(`Bot sudah Aktif dan siap menerima pesan.`);
bot.startWebhook('/webhook', null, 3000);

/*
If you receive Error: 409: Conflict: can't use getUpdates method while
webhook is active, comment bot.startPolling() out, remove // of the following
commands, run your bot once and undo the changes. This will disable the
webhook by setting it to empty.


bot.startPolling();
bot.telegram.setWebhook("");
bot.startWebhook("")
*/


module.exports = {

}
