# PRO OC VZP B2B Proxy

## Build docker image vzp-b2b

Je nutné zapnout BuildKit v souboru ```/etc/docker/daemon.json``` a restartovat deamona.

```
{ 
  "features": { 
    "buildkit": true 
  } 
}
```

Lokálně se za pomocí secrets z BuildKitu přidá následovně. Při přidávání na serveru v UI je nutné dodržet id ```cert``` a typ ```.pem```.

```
DOCKER_BUILDKIT=1 sudo docker build --secret id=cert,src=./../pro-oc-vfn-secrets/cert_ds.pem -t vzp-b2b . --progress=plain
```

## Spuštění docker image vzp-b2b

Env proměnné lokálně vkládané např. z jiného git repozitáře:

1) **(required)** ```ENCRYPT_KEY```
2) **(required)** ```CERT_PASS``` (passphrase for .pem)
3) **(optional)** ```PORT``` (default 3000)

```
export CERT_PASS=$(cat ../pro-oc-vfn-secrets/certpassphrase_ds.txt)
export ENCRYPT_KEY=$(cat ../pro-oc-vfn-secrets/encryptionkey.txt)

sudo docker run --network host -it \
-e ENCRYPT_KEY="${ENCRYPT_KEY}" \
-e CERT_PASS="${CERT_PASS}" \
vzp-b2b
```