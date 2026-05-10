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

        fence-exec = pkgs.writeShellScriptBin "fence-exec" ''
          rule="$1"
          shift

          temporary="$(mktemp)"
          finalized="$(mktemp)"

          trap 'rm $temporary $finalized' EXIT INT PIPE TERM

          C="$(pwd)"
          D=""

          (
            echo '['
            echo $C | while read -d "/" P ; do
              if [[ $P != "" ]]; then
                D="$D/$P"
                echo \"$D\",
              fi
            done
            echo \"$C\"
            echo ']'
          ) > $temporary

          ${with pkgs; lib.getExe jq} '.filesystem.allowRead += input' $rule $temporary > $finalized
          ${with pkgs; lib.getExe fence} --settings $finalized "''${@:-}"
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          name = "edgefeed";
          packages =
            (with pkgs; [
              nodejs

              fence
            ])
            ++ [ fence-exec ];

          shellHook = with pkgs; ''
            export SSL_CERT_FILE=${cacert}/etc/ssl/certs/ca-bundle.crt

            export FENCE_SETTINGS_BUN=$(pwd)/.fence/bun.json
            export FENCE_SETTINGS_GIT=$(pwd)/.fence/git.json

            alias git="${lib.getExe fence} --settings ''${FENCE_SETTINGS_GIT} -- env PATH=${gitFull}/bin:$PATH GIT_SSH_COMMAND='ssh -F /dev/null -o \"ProxyCommand=nc -X 5 -x 127.0.0.1:1080 %h %p\" ' git"
            alias bun="fence-exec ''${FENCE_SETTINGS_BUN} -- ${lib.getExe bun}"

            if command -v pass-cli >/dev/null 2>&1; then
              alias wrangler="env -i PATH=''${PATH} TERM=''${TERM} pass-cli run --env-file .env -- env CLOUDFLARE_INCLUDE_PROCESS_ENV=true $WRANGLER"
            fi
          '';
        };
      }
    );
}
