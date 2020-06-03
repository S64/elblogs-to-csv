import { Command, flags } from '@oclif/command'
import glob from 'glob'
import path from 'path'
import fs from 'fs'

export default class Concat extends Command {

  static flags = {
    glob: flags.string({
      default: '**/*.log.csv'
    }),
    cwd: flags.string({
      default: '.'
    }),
  }

  async run() {
    const { args, flags } = this.parse(Concat)

    const files = glob.sync(
      flags.glob,
      {
        cwd: path.resolve(process.cwd(), flags.cwd)
      }
    )
    .map(x => path.resolve(flags.cwd, x))

    for (let idx in files) {
      const filepath = files[idx]
      const stat = fs.statSync(filepath)

      if(!stat.isFile()) {
        return
      }

      console.log(fs.readFileSync(filepath, 'utf8'))
    }
  }
}
