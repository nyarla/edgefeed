{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          name = "edgefeed";
          packages = with pkgs; [
            bun
          ];

          shellHook = with pkgs; ''
            export SSL_CERT_FILE=${cacert}/etc/ssl/certs/ca-bundle.crt
          '';
        };
      }
    );
}
