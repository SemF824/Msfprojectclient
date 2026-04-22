# Guide d'Implémentation RBAC - MSF Congo Admin

## ✅ Tâches Complétées

### TÂCHE 1 : Hook d'authentification ✓
**Fichier modifié :** `src/hooks/useSupabaseAuth.ts`

Le hook expose maintenant :
- `userRole`: 'admin' | 'superadmin' | 'client' | null
- `isAdmin`: true si role === 'admin' OU 'superadmin'
- Détection chirurgicale du rôle depuis `user.user_metadata.role`

### TÂCHE 2 : ProtectedAdminRoute ✓
**Fichier modifié :** `src/app/components/ProtectedAdminRoute.tsx`

- Vérifie `isAdmin` (englobe admin ET superadmin)
- Affiche un loader élégant pendant `isLoading`
- Redirige vers `/admin` si non authentifié ou sans privilèges

### TÂCHE 3 : RBAC dans AdminLayout ✓
**Fichier modifié :** `src/app/components/AdminLayout.tsx`

Fonctionnalités implémentées :
- ✅ Import de `userRole` depuis `useSupabaseAuth`
- ✅ Badge de rôle visuel (violet pour superadmin, doré pour admin)
- ✅ Menu "Gestion de l'Équipe" visible UNIQUEMENT pour superadmin
- ✅ Menu "Paramètres Système" visible UNIQUEMENT pour superadmin
- ✅ Affichage du nom complet : `first_name` + `last_name`
- ✅ Initiales calculées depuis les noms
- ✅ Navigation conditionnelle selon le rôle

---

## 📖 Comment utiliser le RBAC dans vos pages

### Exemple 1 : Masquer une action de suppression

Dans vos pages de gestion (DemandesManagement, PropertiesManagement, etc.) :

```tsx
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import { Trash2 } from "lucide-react";

export default function DemandesManagement() {
  const { userRole } = useSupabaseAuth();
  
  return (
    <div>
      {/* Autres actions */}
      
      {/* Bouton de suppression - SUPERADMIN UNIQUEMENT */}
      {userRole === 'superadmin' && (
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer (Superadmin uniquement)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

### Exemple 2 : Désactiver un bouton pour les admins simples

```tsx
export default function ClientsPage() {
  const { userRole } = useSupabaseAuth();
  const isSuperadmin = userRole === 'superadmin';
  
  return (
    <button
      onClick={handleDeleteClient}
      disabled={!isSuperadmin}
      className={`px-4 py-2 rounded-lg ${
        isSuperadmin
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
      }`}
    >
      {isSuperadmin ? 'Supprimer le client' : 'Accès superadmin requis'}
    </button>
  );
}
```

### Exemple 3 : Afficher une section entière conditionnellement

```tsx
export default function AdminDashboard() {
  const { userRole } = useSupabaseAuth();
  
  return (
    <div>
      {/* Section visible pour tous les admins */}
      <div className="stats-section">
        {/* Statistiques générales */}
      </div>
      
      {/* Section SUPERADMIN uniquement */}
      {userRole === 'superadmin' && (
        <div className="advanced-controls">
          <h2>Contrôles Avancés</h2>
          <p>Gestion des droits, exports complets, suppressions définitives</p>
          {/* Actions sensibles */}
        </div>
      )}
    </div>
  );
}
```

### Exemple 4 : Modifier dynamiquement des permissions dans un tableau

```tsx
export default function DemandesTable() {
  const { userRole } = useSupabaseAuth();
  
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'client', label: 'Client' },
    { key: 'property', label: 'Propriété' },
    { key: 'status', label: 'Statut' },
    // Colonne "Actions" conditionnelle
    ...(userRole === 'superadmin' ? [{ key: 'delete', label: 'Supprimer' }] : [])
  ];
  
  return (
    <table>
      <thead>
        <tr>
          {columns.map(col => <th key={col.key}>{col.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {requests.map(request => (
          <tr key={request.id}>
            <td>{request.id}</td>
            <td>{request.client}</td>
            <td>{request.property}</td>
            <td>{request.status}</td>
            {userRole === 'superadmin' && (
              <td>
                <button onClick={() => handleDelete(request.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 🎨 Styles des Badges de Rôle

### Badge Superadmin
```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] font-bold rounded-full">
  <Shield className="w-3 h-3" />
  SUPERADMIN
</span>
```

### Badge Admin
```tsx
<span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#d4af37] to-[#f4e3b2] text-[#0a0f1e] text-[10px] font-bold rounded-full">
  ADMIN
</span>
```

---

## 🔐 Hiérarchie des Rôles

1. **superadmin** : Accès complet
   - Gestion de l'équipe
   - Paramètres système
   - Suppressions définitives
   - Exports de données sensibles
   - Modifications des configurations critiques

2. **admin** : Exploitation quotidienne
   - Gestion des demandes de devis
   - Validation des documents
   - Communication avec les clients
   - Consultation des statistiques
   - AUCUNE suppression définitive

3. **client** : Utilisateur final (site public)
   - Consultation des propriétés
   - Envoi de demandes de devis
   - Suivi de leurs demandes

---

## 📋 Checklist d'Implémentation pour une Nouvelle Page Admin

- [ ] Importer `useSupabaseAuth` et extraire `userRole`
- [ ] Identifier les actions sensibles (suppression, export, modification critique)
- [ ] Entourer ces actions de `{userRole === 'superadmin' && <Action />}`
- [ ] Ajouter des tooltips explicatifs pour les admins simples
- [ ] Tester l'affichage avec un compte admin simple
- [ ] Tester l'affichage avec un compte superadmin
- [ ] Vérifier que le backend applique également ces restrictions (RLS Supabase)

---

## ⚠️ Important : Sécurité Côté Backend

Le RBAC côté client (UI) est **visuel uniquement**. La vraie sécurité doit être appliquée côté backend :

1. **Row Level Security (RLS)** sur Supabase
2. **Policies** qui vérifient `auth.jwt() -> user_metadata ->> 'role'`
3. **Edge Functions** qui valident le rôle avant toute action sensible

Exemple de policy Supabase pour les suppressions :

```sql
CREATE POLICY "Seul superadmin peut supprimer" 
ON public.devis_requests
FOR DELETE
USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'superadmin'
);
```

---

## 🚀 Prochaines Étapes Recommandées

1. Appliquer le RBAC dans toutes les pages admin existantes
2. Créer les pages `/equipe` et `/systeme` pour superadmin
3. Implémenter les RLS policies sur Supabase
4. Ajouter des logs d'audit pour les actions superadmin
5. Créer un système de notification pour les changements critiques

---

**Documentation générée le 22/04/2026**  
**Projet MSF Congo - Roger ROC**
