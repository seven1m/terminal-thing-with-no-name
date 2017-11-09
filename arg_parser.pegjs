Expression
  = command:Command args:(Arg)*

Command
  = [^ ]+ { return text() }

Arg
  = _ arg:(DoubleQuotedArg / SingleQuotedArg / BareArg) { return arg }

BareArg
  = ([^ \n] / "\\ ")+ { return text() }
  
DoubleQuotedArg
  = '"' str:('\\"' / [^"])* '"' { return str.join('') }

SingleQuotedArg
  = "'" str:("\\'" / [^'])* "'" { return str.join('') }

_ "whitespace"
  = ([ \t] / "\\\n")*
