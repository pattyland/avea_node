# Accessorios de ejemplo <a href="https://github.com/Alblahm/avea_node/blob/master/accessories/README.md"><img src="https://github.com/Alblahm/Voice-Controled-Acuarium/blob/master/img/Flag_of_Spain.png" align="right" hspace="0" vspace="0" width="35px"></a> <a href="https://github.com/Alblahm/avea_node/blob/master/accessories/README.md"><img src="https://github.com/Alblahm/Voice-Controled-Acuarium/blob/master/img/Flag_of_Union.png" align="right" hspace="0" vspace="0" width="35px"></a>

Esta carpeta contiene varios archivos de accesorios que hacen uso de la librería avea_node para controlar la luz de ElGato Avea.
Para ello se conecta mediante la tecnología bluetooth de baja energía. Para usar estos ejemplos, descarga este repositorio dentro
de la carpeta node_modules y copia el archivo del accesorio en el directorio HAP-Node/accessories de tu sistema.

 Por ejemplo en LINUX OSMC:
 * cp *Avea_EN_accessory.js /home/osmc/HAP-NodeJS/accessories


 Más info en la wiki https://github.com/Alblahm/avea_node/wiki


#### Note: 

>  The file "Sample_1Avea_EN_accessory.js" is for users with only one avea light bulb, it does not need any extra configuration. Just copy and paste. (The ES or EN suffix is for the english or spanish version of the comments generated in the log output).

>  The file "Sample_MultiAvea_EN_accessory.js" is the english version for users with _more than one light_ bulb connected the same bridge. After copy and paste, you have to edit the file to replace the light address of each lamp with your light addresses. You need one copy of the file for each lamp, remember that the names always must finish with the "_accessory.js" suffix.
