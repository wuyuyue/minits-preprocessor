import {join} from 'path'
import {createProgram,transform,createPrinter } from 'typescript'
import * as _ from 'lodash'
import classConstructTransformer from './transformers/class-construct'

const filePath = join(__dirname,'examples/class-construct.ts');
const program = createProgram([filePath], {});
const source = program.getSourceFile(filePath);
const result = transform(source,
    [classConstructTransformer],
);

const printer = createPrinter();
console.info(
  printer.printFile(_.first(result.transformed))
)
