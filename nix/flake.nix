{
  description: "Homelab toolchain and environments";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells = {
          go = import ./devshells/go.nix { inherit pkgs; };
          rust = import ./devshells/rust.nix { inherit pkgs; };
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              ansible
              sshpass
            ];
          };
        };
      }
    );
}
