import { Command, flags } from '@oclif/command'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import moo from 'moo'
import csvStringify from 'csv-stringify'

export default class Convert extends Command {

  static flags = {
    glob: flags.string({
      default: '**/*.log'
    }),
    cwd: flags.string({
      default: '.'
    }),
  }

  async run() {
    const { args, flags } = this.parse(Convert)

    const files = glob.sync(
      flags.glob,
      {
        cwd: path.resolve(process.cwd(), flags.cwd)
      }
    )
    .map(x => path.resolve(flags.cwd, x))

    const lexer = moo.compile({
      WS: / /,
      STRING: [
        { match: /[^\s"]+/ },
        { match: /".*?"/, value: x => x.slice(1, -1) }
      ],
      NL: { match: /(?:\r|\n|\r\n)/, lineBreaks: true },
    })

    const result: any[] = []

    files.forEach(filepath => {
      const stat = fs.statSync(filepath)

      if(!stat.isFile()) {
        return
      }

      lexer.reset(fs.readFileSync(filepath, 'utf8'))

      let current = []
      for (const here of lexer) {
        if (here.type === 'STRING') {
          current.push(here.value)
        } else if (here.type === 'NL') {
          result.push(current)
          current = []
        }
      }
      if (current.length > 0) {
        result.push(current)
      }
    })

    const csv = csvStringify(result, { header: false }, (err, out) => {
      console.log(out)
    })
  }
}
