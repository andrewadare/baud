const keypress = require( 'keypress' );
const julia = require( 'node-julia' );
const chalk = require( 'chalk' );

// Validate and parse command-line args
if ( process.argv.length < 4 ) {
  console.log( 'Usage: node baud.js port_address speed_bps' );
  process.exit( 1 );
}

// Arg list: 0 is node, 1 is this script
const address = process.argv[ 2 ];
const bps = +process.argv[ 3 ];

printBanner( bps );

julia.eval( 'using LibSerialPort' );
julia.exec( 'list_ports' );

const port = julia.exec( 'open', address, bps );

// Read incoming data at 100 Hz
setInterval( function() {
  var chunk = julia.exec( 'readall', port );
  process.stdout.write( ( chunk.length > 0 ) ? chunk : '' );
}, 10 );

keypress( process.stdin );

// Keypress listener
process.stdin.on( 'keypress', function( ch, key ) {
  // Ctrl+c or ctrl+d to exit
  if ( key && key.ctrl && ( key.name == 'd' ) ) {
    process.exit( 0 );
  }
  // Everything except return
  if ( typeof ch !== 'undefined' ) {
    // process.stdout.write( ch );
    julia.exec( 'write', port, ch );
  }
  // Print a newline '\n' instead of a carriage return '\r'
  if ( key && key.name === 'return' ) {
    julia.exec( 'write', port, '\n' );
    // process.stdout.write( '\n' );
  }
} );

process.stdin.setRawMode( true );
process.stdin.resume();

// Print a fancy intro banner
function printBanner( bps ) {
  var baudStyle = chalk.green.bold.bgBlack;
  var banner = [
    baudStyle( ' ______  _______ _     _ ______  ' ),
    baudStyle( ' |_____] |_____| |     | |     \\ ' ),
    baudStyle( ' |_____] |     | |_____| |_____/ ' )
  ];
  banner[ 0 ] += chalk.bgBlack( ' ' );
  banner[ 1 ] += chalk.yellow.bgBlack( ' Connected at ' + bps + ' BPS ' );
  banner[ 2 ] += chalk.white.bgBlack( ' ctrl+d to exit ' );

  var padTo = Math.max( banner[ 1 ].length, banner[ 2 ].length );

  banner.forEach( function( line ) {
    if ( line.length < padTo ) {
      line += chalk.bgBlack( ' ' ).repeat( padTo - line.length );
    }
    console.log( line );
  } );
}