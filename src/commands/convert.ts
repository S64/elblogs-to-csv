import { Command, flags } from '@oclif/command'
import glob from 'glob'
import path from 'path'
import fs from 'fs'
import moo, { Lexer } from 'moo'
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

    for (let idx in files) {
      const filepath = files[idx]
      const stat = fs.statSync(filepath)

      if(!stat.isFile()) {
        return
      }

      console.log(filepath)

      await processFile(lexer, filepath)
    }
  }
}

const processFile = async (lexer: Lexer, filepath: string) => {
  console.log('Start load...')
  lexer.reset(fs.readFileSync(filepath, 'utf8'))
  console.log('loaded.')
  const result = []

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

  console.log('Start write...')
  const stream = csvStringify(result, { header: false })
  await new Promise((resolve, reject) => {
    const chunks: any[] = []

    stream.on('error', (err) => {
      reject(err)
    })
    stream.on('data', (chunk) => {
      chunks.push(chunk)
    })

    stream.on('end', () => {
      const result = Buffer.concat(chunks).toString('utf8')
      fs.writeFileSync(
        [filepath, '.csv'].join(''),
        result
      )
      resolve(result)
    })
  })

  console.log('wrote.')
}
