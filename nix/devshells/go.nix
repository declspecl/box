{ pkgs }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    go_1_24
  ];

  shellHook = ''
    echo "Go 1.24 environment loaded"
  '';
}
