Start
  = typespec:TypeSpec {return typespec}
  
TypeSpec = Statement*
  
Statement
  = comments:Comment {return comments} /
    Typedef

SourceCharacter
  = .
  
EOLN
  = '\n'
  
W "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  
WEOLN = W / EOLN
  
SPACE
  = ' '
  
Comment
  = "/*" comment:(!"*/" SourceCharacter)* "*/"  EOLN? {return {comment: comment.map(function(c){return c[1];}).join('')}}
  
BuiltinTypeString = "string"
  
BuiltinTypeInt = "int"

BuiltinTypeFloat = "float"

BuiltinTypeUnspecifiedObject = "UnspecifiedObject"
  
BuiltinSimpleType
  = BuiltinTypeString / BuiltinTypeInt / BuiltinTypeFloat / BuiltinTypeUnspecifiedObject
  
BuiltinTupleType
  = "tuple" W* "<" value:(Type W* ","* W*)+ ">" {
  	return {
      type: 'tuple',
      spec: value.map(function (v) {
         return v[0];
      })
    };
 }
    
BuiltinListType
  = "list" W* "<" W* value:Type W* ">" {
       return {
         type: 'list',
         spec: value
       };
    }    
    
BuiltinStructType = "structure" W* "{" value:(WEOLN* Type WEOLN+ Identifier WEOLN* LineTerminator)+ WEOLN* "}" {
    return {
      type: 'structure',
      spec: value.map(function (v) {
        return {
          type: v[1],
          identifier: v[3]
         }
       })
     };
}

BuiltinMappingType = "mapping" W* "<" W* key:Type W* "," W* value:Type ">" {
  return {
    type: 'mapping',
    spec: {
      keyType: key,
      valueType: value
    }
  };
}

ReferenceType = "#" Identifier "." Identifier "-" Integer "." Integer "#"

Type = BuiltinListType / BuiltinTupleType / BuiltinStructType /  BuiltinMappingType / BuiltinSimpleType / ReferenceType / Identifier

Integer = [0-9]+

IdentifierCharacter
  = [a-z] / [A-Z] / [0-9] / [_]
  
Identifier "identifier"
  = value:IdentifierCharacter+ {return value.join('');}

LineTerminator = ";"
  
//   = string int float UnspecifiedObject list mapping structure tuple

TypedefKeyword = "typedef"

Typedef = TypedefKeyword W+ type:Type W+ identifier:Identifier W* LineTerminator EOLN* {
  return {
    expression: 'typedef',
    spec: type,
    identifier: identifier
  };
}
 