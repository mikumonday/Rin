#Rin bot
Cytube channel bot

##Setup
1. Clone Repo
2. `npm install`
3. Configure `config.js`
4. `node app.js` or `nodejs app.js`

##Config
###Cytube
`server` - the cytube server to use.

`user` and `pw` - the username and information for the cytube server.

`channel` - the channel Rin will join.
###IRC
`server` - the irc server

`nick` - the nickname Rin will use

`channel` - the channel to join

`pw` - the password used for registration

`onByDefault` - the option to use IRC. *Off by default.*
###Web Interface
`expressport` - the port Express will use for the web interface. *3000 by default.*
###Misc
`commandchar` - the character to use when using a command. *! by default.*

`accessRank` - the user rank need to use access commands. *2 by default.*

`addInterval` - the interval between videos added via the add command. *1500(milliseconds) by default.*

`database` - the name of the database used to store information on videos

`host` - this is used to reference itself for links on the web
