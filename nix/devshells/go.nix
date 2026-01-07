{ pkgs }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    go
    gopls
    gotools
    go-outline
  ];

  shellHook = ''
    echo "Go development environment loaded"
  '';
}
