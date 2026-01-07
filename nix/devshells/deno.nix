{ pkgs }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    deno
  ];

  shellHook = ''
    echo "Deno environment loaded"
  '';
}
