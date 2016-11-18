

## Sample accessories

This folder contains some accessories that make use of the avea_node lib to control the Elgato Avea Light, through low energy bluetooth.
To use them with the Hap-node, download git repository and copy the samples to the accessories folder located under the HAP-node directory of your system.

 For instance in OSMC:
 * cp selected_accessory.js /home/osmc/HAP-NodeJS/accessories


 Find more info in the wiki https://github.com/Alblahm/avea_node/wiki


> Note: 

>  The file "Sample_1Avea_EN_accessory.js" is for users with only one avea light bulb, it does not need any extra configuration. Just copy and paste. (The ES or EN suffix is for the english or spanish version of the comments generated in the log output).

>  The file "dining_accessory.js" is the version for users with more than one light bulb connected the same bridge. You have to edit the file, after copy and paste, to replace the light address with your light addresses. You need one copy of the file for each lamp, remember that the names always must finish with the "_accessory.js" suffix.
