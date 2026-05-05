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
            nodejs

            fence
          ];

          shellHook = with pkgs; ''
            export SSL_CERT_FILE=${cacert}/etc/ssl/certs/ca-bundle.crt

            export FENCE_SETTINGS_GIT=$(pwd)/.fence/git.json
            export FENCE_SETTINGS_BUN=$(pwd)/.fence/bun.json

            export WRANGLER=$(pwd)/node_modules/.bin/wrangler

            alias bun="${pkgs.lib.getExe pkgs.fence} --settings ''${FENCE_SETTINGS_BUN} -- ${pkgs.lib.getExe pkgs.bun}"
            alias git="${pkgs.lib.getExe pkgs.fence} --settings ''${FENCE_SETTINGS_GIT} -- env PATH=${pkgs.gitFull}/bin:$PATH GIT_SSH_COMMAND='ssh -F /dev/null -o \"ProxyCommand=nc -X 5 -x 127.0.0.1:1080 %h %p\" ' git"

            if command -v pass-cli ; then
              alias wrangler="env -i PATH=''${PATH} TERM=''${TERM} pass-cli run --env-file .env -- env CLOUDFLARE_INCLUDE_PROCESS_ENV=true $WRANGLER"
            fi
          '';
        };
      }
    );
}
