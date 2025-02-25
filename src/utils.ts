import { NodePath } from 'babel-traverse';
import babelTraverse from 'babel-traverse';
import { File, Node } from 'babel-types';
import generate from 'babel-generator';
import * as _ from 'lodash';
import { readFileSync } from 'fs';
import * as parser from 'babylon';

export function parseCode(source: string): File {
    return parser.parse(source, { sourceType: 'module' });
};

export function readCode(filename: string) {
    return readFileSync(filename).toString('utf8');
};

export function isStatement(path: NodePath): boolean {
    const { type } = path;
    return (
        (type.match(/statement$/i) || (type.toLowerCase() === 'variabledeclaration')) &&
        (type.toLowerCase() !== 'blockstatement')
    );
};

export function traverse(tree: File, onEachPath, onExit) {
    babelTraverse(tree, {
        enter(path: NodePath) {
            if (!path.node.loc) {
                return;
            }
            return onEachPath(path);
        },

        exit(path: NodePath) {
            if (path.type === 'Program') {
                onExit(path);
            }
        }
    });
};

export function toPlainObjectRecursive(obj: any): object {
    return _.transform(_.toPlainObject(obj), (result, value, key) => {
        result[key] = _.toPlainObject(value);
        return result;
    }, {});
};

export function generateCode(tree: File): string {
    const { code } = generate(tree, {
        comments: false
    });
    return code;
};

export function toLCOV(coverageReport: any): string {
    let allLines = 0;
    let hitLines = 0;
    let report = 'SF:source.js\n';
    _.each(coverageReport.c, (counter, statementId) => {
        const { line } = coverageReport.statementMap[statementId].start;
        report += `DA:${ line },${ counter }\n`;
        allLines++;
        if(counter) hitLines++;
    });
    report += `LH:${hitLines}\n`;
    report += `LF:${allLines}\n`;
    report += 'end_of_record';
    return report;
};
