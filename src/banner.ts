import pc from 'picocolors';

export function printAdBanner(mode?: string): void {
  console.log(
    '\n  ' + pc.cyan(pc.bold('█████╗ ██████╗ ')) +
    '\n  ' + pc.cyan(pc.bold('██╔══██╗██╔══██╗')) + '   ' + pc.white(pc.bold('⚡ peer-port')) + ' ' + pc.cyan('v1.0.5') + (mode ? ' ' + pc.yellow(`(${mode})`) : '') +
    '\n  ' + pc.cyan(pc.bold('███████║██║  ██║')) + '   ' + pc.magenta('Crafted with ❤️  by Ankit Dhiman') +
    '\n  ' + pc.cyan(pc.bold('██╔══██║██║  ██║')) + '   ' + pc.dim('Instant Global Public Tunnel & QA Suite') +
    '\n  ' + pc.cyan(pc.bold('██║  ██║██████╔╝')) +
    '\n  ' + pc.cyan(pc.bold('╚═╝  ╚═╝╚═════╝ ')) + '\n'
  );
}
