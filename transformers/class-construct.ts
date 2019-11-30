import {SyntaxKind,forEachChild,visitNode,visitEachChild,TransformationContext,Transformer,Node,ClassDeclaration,VisitResult,ConstructorDeclaration,ThisExpression,NewExpression,VariableStatement,VariableDeclarationList,VariableDeclaration} from 'typescript'
import * as ts from 'typescript';
const transformer= (context: TransformationContext): Transformer<Node> => {
  return function (node:Node) {
      return visitNode(node, visit);
  };

  function visit(node: Node): VisitResult<Node> {
      switch (node.kind) {
          case SyntaxKind.ClassDeclaration:
            return visitClassDeclaration(node as ClassDeclaration);
          case SyntaxKind.VariableStatement:
            return visitVariableStatement(node as VariableStatement);
          case SyntaxKind.NewExpression:
            return visitNewExpression(node as NewExpression);
      }
      return visitEachChild(node, visit, context);
  }

  function visitClassDeclaration(node: ClassDeclaration):VisitResult<Node>{
    const className = node.name.escapedText
    const constructNode:ConstructorDeclaration = forEachChild(node,(subNode)=>{
      if(subNode && subNode.kind === SyntaxKind.Constructor){
        let constructNode: ConstructorDeclaration = subNode as  ConstructorDeclaration
        return constructNode
      }
    })
    const thisParam = ts.createParameter(
      undefined,
      undefined,
      undefined,
      ts.createIdentifier("_this"),
      undefined,
      ts.createTypeReferenceNode(
        ts.createIdentifier(`${className}`),
        undefined
      ),
      undefined
    )
    const newParams = [thisParam].concat(constructNode.parameters)
    const newConstruct = ts.createFunctionDeclaration(
      undefined,
      undefined,
      undefined,
      ts.createIdentifier(`${className}_constructor`),
      undefined,
      newParams,
      ts.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
      visitNode(constructNode.body,visitThisExpression)
    )
      
    return [node,newConstruct]
  }

  function visitThisExpression(node: ThisExpression):VisitResult<Node>{
    if(node && node.kind === SyntaxKind.ThisKeyword){
      return ts.createIdentifier(`_this`)
    }
    return visitEachChild(node, visitThisExpression, context);
  }

  function visitVariableStatement(node: VariableStatement):VisitResult<Node>{
    const newObjectDeclarations: VariableDeclaration[] = []
    ts.forEachChild(node.declarationList,null,(subNodes)=>{
      for(var i=0;i<subNodes.length;i++){
        const subNode = subNodes[i]
        if(subNode && subNode.kind === SyntaxKind.VariableDeclaration){
          const declaration = subNode as VariableDeclaration
          if(ts.isNewExpression(declaration.initializer)){
            newObjectDeclarations.push(declaration)
          }
  
        }
      }
    })
    const newConstructs= newObjectDeclarations.map((newExpression:VariableDeclaration)=>{
      const newVariable = newExpression.name
      const initializer = newExpression.initializer as any
      const constructName = `${initializer.expression.escapedText}_constructor`
      const parameters = initializer.arguments
      return ts.createCall(
          ts.createIdentifier(constructName),
          undefined,
          [
            newVariable,
            ...parameters
          ]
        )
    })
    return [node,...newConstructs]
  }

  function visitNewExpression(node: NewExpression): VisitResult<Node>{
    const expression = node.expression as any
    const constructName = `${expression.escapedText}_constructor`

    return ts.createCall(
      ts.createIdentifier(constructName),
      undefined,
      [
        node,
        ...node.arguments
      ]
    )
  }
};

export default transformer