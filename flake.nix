{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      forEachSystem = nixpkgs.lib.genAttrs [ "aarch64-darwin" "x86_64-linux" ];

      pkgsFor = forEachSystem (system: import nixpkgs { inherit system; });

      nodejsFor = forEachSystem (system: pkgsFor.${system}.nodejs_20);
    in
    {
      devShells = forEachSystem
        (system:
          let
            pkgs = pkgsFor.${system};
            nodejs = nodejsFor.${system};
          in
          {
            default = pkgs.mkShell
              {
                packages = [
                  nodejs
                  nodejs.pkgs.pnpm
                  pkgs.sqlite-interactive
                  pkgs.turso-cli
                  pkgs.nodePackages.vercel
                ];
              };
          });
    };
}
