import chalk from 'chalk';
import { clearScreen, printHeader, prompt, pause, selectMenuOption } from '../../utils/cli.js';
import { buildTransitionTable, generateMarkovText } from './core.js';

const PRESETS: Record<string, { name: string; text: string }> = {
  shakespeare: {
    name: 'Shakespeare\'s Hamlet Soliloquy',
    text: `To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them? To die: to sleep;
No more; and by a sleep to say we end
The heart-ache and the thousand natural shocks
That flesh is heir to, 'tis a consummation
Devoutly to be wish'd. To die, to sleep;
To sleep: perchance to dream: ay, there's the rub;
For in that sleep of death what dreams may come
When we have shuffled off this mortal coil,
Must give us pause: there's the respect
That makes calamity of so long life;
For who would bear the whips and scorns of time,
The oppressor's wrong, the proud man's contumely,
The pangs of despised love, the law's delay,
The insolence of office and the spurns
That patient merit of the unworthy takes,
When he himself might his quietus make
With a bare bodkin?`,
  },
  jabberwocky: {
    name: 'Lewis Carroll\'s Jabberwocky',
    text: `Twas brillig, and the slithy toves
Did gyre and gimble in the wabe:
All mimsy were the borogoves,
And the mome raths outgrabe.
Beware the Jabberwock, my son!
The jaws that bite, the claws that catch!
Beware the Jubjub bird, and shun
The frumious Bandersnatch!
He took his vorpal sword in hand;
Long time the manxome foe he sought—
So rested he by the Tumtum tree
And stood awhile in thought.
And, as in uffish thought he stood,
The Jabberwock, with eyes of flame,
Came whiffling through the tulgey wood,
And burbled as it came!
One, two! One, two! And through and through
The vorpal blade went snicker-snack!
He left it dead, and with its head
He went galumphing back.`,
  },
  tech: {
    name: 'Tech Startup Pitch Buzzwords',
    text: `We leverage blockchain-enabled synergy to disrupt the decentralized AI web3 landscape.
Our machine learning paradigm shift optimizes low-latency cloud architectures in real-time.
By harnessing artificial intelligence paradigms, we optimize operational scalability with organic growth.
We build hyper-local, cloud-native API integrations using serverless edge computing solutions.
Our mission is to democratize agile workflows through digital transformation and deep learning.
A customer-centric platform designed to facilitate cross-functional alignment and hyper-growth scaling.
We deliver actionable data insights utilizing robust, high-performance data lakes and models.`,
  },
};

export async function run(): Promise<void> {
  let running = true;
  while (running) {
    const keys = Object.keys(PRESETS);
    const menuOptions = keys.map((key) => ({
      name: PRESETS[key].name,
      description: `Preset text corpus`,
    }));
    menuOptions.push({
      name: 'Enter Custom Text',
      description: 'Input your own corpus directly',
    });

    const idx = await selectMenuOption(
      '✍️ Markov Chain Text Generator',
      'Generate procedural nonsense text based on word transition probabilities.',
      menuOptions
    );

    if (idx === menuOptions.length) {
      running = false;
      break;
    }

    let corpus = '';
    let selectedName = '';

    if (idx < keys.length) {
      const preset = PRESETS[keys[idx]];
      corpus = preset.text;
      selectedName = preset.name;
    } else {
      selectedName = 'Custom Text';
      clearScreen();
      printHeader('✍️ Custom Text Input', 'Enter or paste corpus text below.');
      corpus = await prompt('Enter your custom text: ');
      if (!corpus) {
        console.log(chalk.red('Corpus cannot be empty. Press Enter to retry.'));
        await pause();
        continue;
      }
    }

    const nInput = await prompt('Prefix word-length (1, 2, or 3, default 2): ');
    const prefixLen = nInput ? parseInt(nInput) : 2;
    if (prefixLen < 1 || prefixLen > 3) {
      console.log(chalk.red('Prefix size must be between 1 and 3. Press Enter to retry.'));
      await pause();
      continue;
    }

    const lenInput = await prompt('Words to generate (default 60): ');
    const outputLen = lenInput ? parseInt(lenInput) : 60;

    console.log(chalk.yellow('\nBuilding transition matrix...'));
    const table = buildTransitionTable(corpus, prefixLen);

    if (table.size === 0) {
      console.log(chalk.red('Text corpus is too short for the chosen prefix length. Press Enter to retry.'));
      await pause();
      continue;
    }

    console.log(chalk.yellow('Generating text...'));
    const text = generateMarkovText(table, outputLen, prefixLen);

    clearScreen();
    printHeader(`✍️ Generated Text from: ${selectedName}`, `Prefix Length: ${prefixLen} | Target Length: ${outputLen} words`);

    console.log(chalk.bold.green('Output:'));
    console.log(chalk.italic.white(`\n"${text}"\n`));

    await pause('Press Enter to return to Markov Chain menu...');
  }
}
