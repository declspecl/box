{ pkgs }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    rustc
    cargo
    rustfmt
    clippy
    rust-analyzer
  ];

  shellHook = ''
    echo "Rust development environment loaded"
  '';
}
