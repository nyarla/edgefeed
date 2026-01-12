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

            sec-exec() {
              # `sec` can take from https://github.com/nyarla/sec
              env -i $(SEC_ENV=development sec env | grep -P "EDGEFEED_[A-Z]+=" ; echo PATH=$PATH ; echo SSL_CERT_FILE=$SSL_CERT_FILE) "''${@:-}"
            }

            wrangler() {
              sec-exec env CLOUDFLARE_INCLUDE_PROCESS_ENV=true bun run wrangler "''${@:-}"
            }
          '';
        };
      }
    );
}
