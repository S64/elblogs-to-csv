import { Command, flags } from '@oclif/command'
import glob from 'glob'
import path from 'path'
import zlib from 'zlib'
import fs from 'fs'

export default class Extract extends Command {

  static flags = {
    glob: flags.string({
      default: '**/*.log.gz'
    }),
    cwd: flags.string({
      default: '.'
    }),
  }

  async run() {
    const { args, flags } = this.parse(Extract)

    const result = glob
      .sync(
        flags.glob,
        {
          cwd: path.resolve(process.cwd(), flags.cwd)
        }
      )
      .map(x => path.resolve(flags.cwd, x))

      result.forEach(filepath => {
        const stat = fs.statSync(filepath)
        if (!stat.isFile()) {
          return
        }

        console.log(filepath)
        const bin = zlib.gunzipSync(fs.readFileSync(filepath))

        let newFilepath: string
        if (path.extname(filepath) === '.gz') {
          newFilepath = filepath.slice(0, -3)
        } else {
          newFilepath = [filepath, '.unzipped'].join('')
        }

        fs.writeFileSync(newFilepath, bin)
      })

  }

}
